
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/middleware/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    date: /* @__PURE__ */ new Date()
  });
};

// src/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
import { env } from "process";
dotenv.config({
  quiet: true,
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: env.PORT || 5e3,
  environment: env.NODE_ENV || "development",
  database_url: env.DATABASE_URL,
  app_url: env.APP_URL,
  bcrypt_salt_rounds: env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: env.JWT_REFRESH_EXPIRES_IN,
  stripe_product_price_id: env.STRIPE_PRODUCT_PRICE_ID,
  stripe_secret_key: env.STRIPE_SECRET_KEY,
  stripe_webhook_secret: env.STRIPE_WEBHOOK_SECRET
};
var config_default = config;

// src/module/auth/auth.route.ts
import { Router } from "express";

// src/shared/utils/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/shared/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta
  });
};

// src/module/auth/auth.controller.ts
import httpStatus from "http-status";

// src/module/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/module/auth/auth.constant.ts
var USER_ROLE = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  TECHNICIAN: "TECHNICIAN"
};

// src/shared/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, expiresIn) => {
  const token = jwt.sign(
    payload,
    secret,
    {
      expiresIn
    }
  );
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken
    };
  } catch (error) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
var jwtUtils = {
  createToken,
  verifyToken
};

// src/module/auth/auth.service.ts
var registerUserIntoDB = async (payload) => {
  const { name, email, phone, password, role } = payload;
  if (!name || !email || !phone || !password || !role) {
    throw new Error(
      "Please provide all required fields: name, email, phone, password, and role"
    );
  }
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }]
    }
  });
  if (existingUser) {
    throw new Error("User already exists");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  const normalizedRole = payload.role.trim().toUpperCase();
  if (normalizedRole !== USER_ROLE.CUSTOMER && normalizedRole !== USER_ROLE.TECHNICIAN) {
    throw new Error("Invalid role");
  }
  const roleData = await prisma.role.findUnique({
    where: {
      name: normalizedRole
    }
  });
  if (!roleData) {
    throw new Error("Role not found");
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config_default.bcrypt_salt_rounds)
  );
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        roleId: roleData.id,
        name,
        email,
        phone,
        passwordHash: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });
    if (roleData.name === USER_ROLE.TECHNICIAN) {
      await tx.technicianProfile.create({
        data: {
          userId: newUser.id
        }
      });
    }
    return newUser;
  });
  return {
    ...user,
    role: user.role.name
  };
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  if (!email || !password) {
    throw new Error("Please provide both email and password");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email
    },
    include: {
      role: true
    }
  });
  if (user.status === "BANNED") {
    throw new Error("Your account has been blocked. Please contact support.");
  }
  const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatched) {
    throw new Error("Invalid Password");
  }
  const jwtPayload = {
    id: user.id
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken
  };
};
var authService = {
  registerUserIntoDB,
  loginUserIntoDB
};

// src/module/auth/auth.controller.ts
var registerUser = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const user = await authService.registerUserIntoDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: user
  });
});
var loginUser = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const { accessToken, refreshToken } = await authService.loginUserIntoDB(payload);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config_default.environment === "production",
    sameSite: config_default.environment === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hour or 1 day
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config_default.environment === "production",
    sameSite: config_default.environment === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: { accessToken, refreshToken }
  });
});
var authController = {
  registerUser,
  loginUser
};

// src/module/auth/auth.route.ts
var router = Router();
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/middleware/globalErrorHandler.ts
import { Prisma } from "@prisma/client";
import httpStatus2 from "http-status";
var globalErrorHandler = (err, req, res, next) => {
  console.log("Error : ", err);
  let statusCode;
  let errorMessage = err.message || "Internal Server Error";
  let errorName = err.name || "Internal Server Error";
  let errorDetails = err.stack;
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus2.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus2.BAD_REQUEST, errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus2.BAD_REQUEST, errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus2.BAD_REQUEST, errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus2.UNAUTHORIZED;
      errorMessage = "Authentication failed against database server. Please Check Your Credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus2.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus2.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution";
  }
  res.status(httpStatus2.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus2.INTERNAL_SERVER_ERROR,
    name: errorName,
    message: errorMessage,
    error: errorDetails
  });
};

// src/module/user/user.route.ts
import { Router as Router2 } from "express";

// src/module/user/user.controller.ts
import httpStatus3 from "http-status";

// src/module/admin/admin.service.ts
var getAdminProfileFromDB = async (userId) => {
  const admin = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    omit: {
      roleId: true,
      passwordHash: true,
      deletedAt: true
    },
    include: {
      role: {
        select: {
          name: true
        }
      }
    }
  });
  return {
    ...admin,
    role: admin.role.name
  };
};
var getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    omit: {
      roleId: true,
      passwordHash: true,
      deletedAt: true
    },
    include: {
      role: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return users.map((user) => ({
    ...user,
    role: user.role.name
  }));
};
var getAllBookingsFromDB = async () => {
  const bookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return bookings;
};
var getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return categories;
};
var createCategoryIntoDB = async (payload) => {
  const { name, icon, description, status } = payload;
  if (Object.keys(payload).length === 0) {
    throw new Error("Please provide category information.");
  }
  const normalizedName = name.trim();
  const normalizedStatus = status ? status.toUpperCase() : void 0;
  const isNameExist = await prisma.category.findUnique({
    where: {
      name: normalizedName
    }
  });
  if (isNameExist) {
    throw new Error("Category already exists.");
  }
  const category = await prisma.category.create({
    data: {
      name: normalizedName,
      icon,
      description,
      status: normalizedStatus
    }
  });
  return category;
};
var createServiceIntoDB = async (payload) => {
  const { categoryId, title, description, status } = payload;
  if (Object.keys(payload).length === 0) {
    throw new Error("Please provide service information.");
  }
  const normalizedTitle = title.trim();
  const normalizedStatus = status ? status.toUpperCase() : void 0;
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId
    }
  });
  if (!category) {
    throw new Error("Category not found.");
  }
  const isServiceExist = await prisma.service.findFirst({
    where: {
      categoryId,
      title: normalizedTitle
    }
  });
  if (isServiceExist) {
    throw new Error("Service already exists in this category.");
  }
  const service = await prisma.service.create({
    data: {
      categoryId,
      title: normalizedTitle,
      description,
      status: normalizedStatus
    },
    include: {
      category: true
    }
  });
  return service;
};
var updateUserStatusIntoDB = async (id, payload) => {
  const { status } = payload;
  if (!status) {
    throw new Error("Status is required.");
  }
  const normalizedStatus = status.toUpperCase();
  const user = await prisma.user.findUnique({
    where: {
      id
    },
    include: {
      role: true
    }
  });
  if (!user) {
    throw new Error("User not found.");
  }
  if (user.role.name === "ADMIN") {
    throw new Error("Admin status cannot be changed.");
  }
  const updatedUser = await prisma.user.update({
    where: {
      id
    },
    data: {
      status: normalizedStatus
    },
    omit: {
      passwordHash: true,
      roleId: true,
      deletedAt: true
    },
    include: {
      role: {
        select: {
          name: true
        }
      }
    }
  });
  return {
    ...updatedUser,
    role: updatedUser.role.name
  };
};
var adminService = {
  getAllUsersFromDB,
  getAllBookingsFromDB,
  getAllCategoriesFromDB,
  createCategoryIntoDB,
  createServiceIntoDB,
  updateUserStatusIntoDB
};

// src/module/technician/technician.service.ts
import { ServiceStatus } from "@prisma/client";
import { AvailabilityStatus } from "@prisma/client";
import { BookingStatus } from "@prisma/client";
var getTechnicianProfileFromDB = async (userId) => {
  const technician = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    omit: {
      roleId: true,
      passwordHash: true,
      deletedAt: true
    },
    include: {
      role: {
        select: {
          name: true
        }
      },
      technicianProfile: {
        include: {
          technicianServices: {
            include: {
              service: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  return {
    ...technician,
    role: technician.role.name
  };
};
var getMyBookingsFromDB = async (userId) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId
    }
  });
  if (!technician) {
    throw new Error("Technician profile not found.");
  }
  const bookings = await prisma.booking.findMany({
    where: {
      technicianService: {
        technicianId: technician.id
      }
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          city: true
        }
      },
      technicianService: {
        include: {
          service: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      payment: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return bookings;
};
var updateProfileIntoDB = async (userId, payload) => {
  const {
    bio,
    yearsOfExperience,
    experienceDescription,
    availabilityStatus,
    averageRating,
    totalReviews,
    totalCompletedJobs,
    technicianServices
  } = payload;
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId
    }
  });
  if (!technician) {
    throw new Error("Technician profile not found.");
  }
  return await prisma.$transaction(async (tx) => {
    await tx.technicianProfile.update({
      where: {
        userId
      },
      data: {
        bio,
        yearsOfExperience,
        experienceDescription,
        availabilityStatus,
        averageRating,
        totalReviews,
        totalCompletedJobs
      }
    });
    if (technicianServices?.length) {
      for (const item of technicianServices) {
        const service = await tx.service.findUnique({
          where: {
            id: item.serviceId
          }
        });
        if (!service) {
          throw new Error(`Service not found: ${item.serviceId}`);
        }
        await tx.technicianService.upsert({
          where: {
            technicianId_serviceId: {
              technicianId: technician.id,
              serviceId: item.serviceId
            }
          },
          update: {
            price: item.price,
            pricingType: item.pricingType,
            estimatedDuration: item.estimatedDuration,
            serviceImage: item.serviceImage,
            status: item.status
          },
          create: {
            technicianId: technician.id,
            serviceId: item.serviceId,
            price: item.price,
            pricingType: item.pricingType,
            estimatedDuration: item.estimatedDuration,
            serviceImage: item.serviceImage,
            status: item.status ?? ServiceStatus.ACTIVE
          }
        });
      }
    }
    const updatedProfile = await tx.technicianProfile.findUnique({
      where: {
        userId
      },
      omit: {
        userId: true
      },
      include: {
        technicianServices: {
          include: {
            service: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });
    return updatedProfile;
  });
};
var updateAvailabilityStatusIntoDB = async (userId, payload) => {
  const { availabilityStatus } = payload;
  if (!availabilityStatus) {
    throw new Error("Availability status is required.");
  }
  const normalizedAvailabilityStatus = availabilityStatus.toUpperCase();
  if (!Object.values(AvailabilityStatus).includes(normalizedAvailabilityStatus)) {
    throw new Error(
      `Invalid availability status. Allowed values: ${Object.values(
        AvailabilityStatus
      ).join(", ")}`
    );
  }
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId
    }
  });
  if (!technician) {
    throw new Error("Technician profile not found.");
  }
  await prisma.technicianProfile.update({
    where: {
      userId
    },
    data: {
      availabilityStatus: normalizedAvailabilityStatus
    }
  });
  return await prisma.technicianProfile.findUnique({
    where: {
      userId
    },
    omit: {
      userId: true
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          profileImage: true
        }
      }
    }
  });
};
var updateBookingStatusIntoDB = async (userId, bookingId, payload) => {
  const { status } = payload;
  const normalizedStatus = status.toUpperCase();
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId
    }
  });
  if (!technician) {
    throw new Error("Technician profile not found.");
  }
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      technicianService: {
        technicianId: technician.id
      }
    }
  });
  if (!booking) {
    throw new Error("Booking not found.");
  }
  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
    throw new Error(
      `Booking is already ${booking.status.toLowerCase()}.`
    );
  }
  const updatedBooking = await prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      status: normalizedStatus,
      completedAt: status === BookingStatus.COMPLETED ? /* @__PURE__ */ new Date() : null
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      },
      technicianService: {
        include: {
          service: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      payment: true
    }
  });
  return updatedBooking;
};
var technicianService = {
  getMyBookingsFromDB,
  updateProfileIntoDB,
  updateAvailabilityStatusIntoDB,
  updateBookingStatusIntoDB
};

// src/module/user/user.service.ts
var getCustomerProfile = async (userId) => {
  const customer = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    omit: {
      roleId: true,
      passwordHash: true,
      deletedAt: true
    },
    include: {
      role: {
        select: {
          name: true
        }
      }
    }
  });
  return {
    ...customer,
    role: customer.role.name
  };
};
var getMyProfileFromDB = async (user) => {
  switch (user.role) {
    case USER_ROLE.CUSTOMER:
      return getCustomerProfile(user.id);
    case USER_ROLE.TECHNICIAN:
      return getTechnicianProfileFromDB(user.id);
    case USER_ROLE.ADMIN:
      return getAdminProfileFromDB(user.id);
    default:
      throw new Error("Invalid role");
  }
};
var updateProfileIntoDB2 = async (userId, payload) => {
  const {
    name,
    email,
    phone,
    profileImage,
    address,
    city,
    latitude,
    longitude
  } = payload;
  await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    }
  });
  if (email) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId
        }
      }
    });
    if (existingEmail) {
      throw new Error("Email already exists.");
    }
  }
  if (phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
        NOT: {
          id: userId
        }
      }
    });
    if (existingPhone) {
      throw new Error("Phone already exists.");
    }
  }
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      name,
      email,
      phone,
      profileImage,
      address,
      city,
      latitude,
      longitude
    },
    omit: {
      passwordHash: true,
      roleId: true,
      deletedAt: true
    },
    include: {
      role: {
        select: {
          name: true
        }
      }
    }
  });
  return {
    ...user,
    role: user.role.name
  };
};
var userService = {
  getMyProfileFromDB,
  updateProfileIntoDB: updateProfileIntoDB2
};

// src/module/user/user.controller.ts
var getMyProfile = catchAsync(async (req, res) => {
  const profile = await userService.getMyProfileFromDB(req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus3.OK,
    message: "User profile fetched successfully",
    data: profile
  });
});
var updateMyProfile = catchAsync(async (req, res) => {
  const profile = await userService.updateProfileIntoDB(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus3.OK,
    message: "User profile updated successfully",
    data: profile
  });
});
var userController = {
  getMyProfile,
  updateMyProfile
};

// src/middleware/authentication.ts
var authenticate = catchAsync(
  async (req, res, next) => {
    const token = req.cookies.accessToken ? req.cookies.accessToken : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization?.split(" ")[1] : req.headers.authorization;
    if (!token) {
      throw new Error("Unauthorized Access");
    }
    const verifiedToken = jwtUtils.verifyToken(token, config_default.jwt_access_secret);
    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }
    const payload = verifiedToken.data;
    const user = await prisma.user.findUnique({
      where: {
        id: payload.id
      },
      include: {
        role: true
      }
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.status === "BANNED") {
      throw new Error("Your account is banned");
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name
    };
    next();
  }
);

// src/module/user/user.route.ts
var router2 = Router2();
router2.get("/me", authenticate, userController.getMyProfile);
router2.patch("/me", authenticate, userController.updateMyProfile);
var userRoute = router2;

// src/module/technician/technician.route.ts
import { Router as Router3 } from "express";

// src/module/technician/technician.controller.ts
import httpStatus4 from "http-status";
var getMyBookings = catchAsync(async (req, res) => {
  const result = await technicianService.getMyBookingsFromDB(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "My Bookings retrieved successfully",
    data: result
  });
});
var updateProfile = catchAsync(async (req, res) => {
  const result = await technicianService.updateProfileIntoDB(
    req.user.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Profile updated successfully",
    data: result
  });
});
var updateAvailabilityStatus = catchAsync(async (req, res) => {
  const result = await technicianService.updateAvailabilityStatusIntoDB(
    req.user.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Availability status updated successfully",
    data: result
  });
});
var updateBookingsStatus = catchAsync(async (req, res) => {
  const result = await technicianService.updateBookingStatusIntoDB(
    req.user.id,
    req.params.bookingId,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Booking status updated successfully",
    data: result
  });
});
var technicianController = {
  getMyBookings,
  updateProfile,
  updateAvailabilityStatus,
  updateBookingsStatus
};

// src/middleware/authorization.ts
var authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw new Error("Unauthorized Access");
  }
  if (!roles.includes(req.user.role)) {
    throw new Error("Forbidden Access");
  }
  next();
};

// src/module/technician/technician.route.ts
var router3 = Router3();
router3.put(
  "/profile",
  authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.updateProfile
);
router3.patch(
  "/availability",
  authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.updateAvailabilityStatus
);
router3.get(
  "/bookings",
  authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.getMyBookings
);
router3.patch(
  "/bookings/:bookingId",
  authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.updateBookingsStatus
);
var technicianRoute = router3;

// src/module/admin/admin.route.ts
import { Router as Router4 } from "express";

// src/module/admin/admin.controller.ts
import httpStatus5 from "http-status";
var getAllUsers = catchAsync(async (req, res) => {
  const result = await adminService.getAllUsersFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "All Users retrieved successfully.",
    data: result
  });
});
var getAllBookings = catchAsync(async (req, res) => {
  const result = await adminService.getAllBookingsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "All Bookings retrieved successfully.",
    data: result
  });
});
var getAllCategories = catchAsync(async (req, res) => {
  const result = await adminService.getAllCategoriesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "All Categories retrieved successfully.",
    data: result
  });
});
var createCategory = catchAsync(async (req, res) => {
  const result = await adminService.createCategoryIntoDB(
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Category created successfully.",
    data: result
  });
});
var createService = catchAsync(async (req, res) => {
  const result = await adminService.createServiceIntoDB(
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Service created successfully.",
    data: result
  });
});
var updateUserStatus = catchAsync(async (req, res) => {
  const result = await adminService.updateUserStatusIntoDB(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "User status updated successfully.",
    data: result
  });
});
var adminController = {
  getAllUsers,
  getAllBookings,
  getAllCategories,
  createCategory,
  createService,
  updateUserStatus
};

// src/module/admin/admin.route.ts
var router4 = Router4();
router4.get(
  "/users",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllUsers
);
router4.get(
  "/bookings",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllBookings
);
router4.get(
  "/categories",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllCategories
);
router4.post(
  "/categories",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.createCategory
);
router4.post(
  "/services",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.createService
);
router4.patch(
  "/users/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.updateUserStatus
);
var adminRoute = router4;

// src/module/service/services.route.ts
import { Router as Router5 } from "express";

// src/module/service/services.controller.ts
import httpStatus6 from "http-status";

// src/module/service/services.service.ts
var getAllServicesFromDB = async () => {
  const services = await prisma.service.findMany({
    where: {
      status: "ACTIVE"
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return services.map(({ category, ...service }) => ({
    ...service,
    category: category.name
  }));
};
var getAllTechnicianServicesFromDB = async (query) => {
  const {
    category,
    city,
    rating,
    minPrice,
    maxPrice
  } = query;
  const where = {
    status: "ACTIVE",
    service: {
      status: "ACTIVE"
    },
    technician: {
      availabilityStatus: "ONLINE"
    }
  };
  if (category) {
    where.service.category = {
      name: {
        equals: category,
        mode: "insensitive"
      }
    };
  }
  if (city) {
    where.technician.user = {
      city: {
        equals: city,
        mode: "insensitive"
      }
    };
  }
  if (rating) {
    where.technician.averageRating = {
      gte: Number(rating)
    };
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) {
      where.price.gte = Number(minPrice);
    }
    if (maxPrice) {
      where.price.lte = Number(maxPrice);
    }
  }
  const services = await prisma.technicianService.findMany({
    where,
    select: {
      id: true,
      price: true,
      pricingType: true,
      estimatedDuration: true,
      serviceImage: true,
      service: {
        select: {
          name: true,
          description: true,
          category: {
            select: {
              name: true
            }
          }
        }
      },
      technician: {
        select: {
          averageRating: true,
          totalReviews: true,
          user: {
            select: {
              id: true,
              name: true,
              city: true,
              profileImage: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return services.map((item) => ({
    id: item.id,
    price: item.price,
    pricingType: item.pricingType,
    estimatedDuration: item.estimatedDuration,
    serviceImage: item.serviceImage,
    service: {
      name: item.service.name,
      description: item.service.description,
      category: item.service.category.name
    },
    technician: {
      id: item.technician.user.id,
      name: item.technician.user.name,
      city: item.technician.user.city,
      profileImage: item.technician.user.profileImage,
      averageRating: item.technician.averageRating,
      totalReviews: item.technician.totalReviews
    }
  }));
};
var getAllTechniciansFromDB = async () => {
  const technicians = await prisma.technicianProfile.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return technicians;
};
var getTechnicianByIdFromDB = async (technicianId) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      id: technicianId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          city: true
        }
      },
      technicianServices: {
        where: {
          status: "ACTIVE"
        },
        include: {
          service: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          bookings: {
            include: {
              review: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true
                }
              }
            }
          }
        }
      }
    }
  });
  if (!technician) {
    throw new Error("Technician not found.");
  }
  const services = technician.technicianServices.map((item) => ({
    id: item.id,
    price: item.price,
    pricingType: item.pricingType,
    estimatedDuration: item.estimatedDuration,
    serviceImage: item.serviceImage,
    service: {
      id: item.service.id,
      name: item.service.name,
      description: item.service.description,
      category: item.service.category.name
    }
  }));
  const reviews = technician.technicianServices.flatMap((service) => service.bookings).filter((booking) => booking.review).map((booking) => ({
    id: booking.review.id,
    rating: booking.review.rating,
    comment: booking.review.comment,
    createdAt: booking.review.createdAt,
    customer: {
      id: booking.customer.id,
      name: booking.customer.name,
      profileImage: booking.customer.profileImage
    }
  }));
  return {
    id: technician.id,
    name: technician.user.name,
    profileImage: technician.user.profileImage,
    city: technician.user.city,
    bio: technician.bio,
    yearsOfExperience: technician.yearsOfExperience,
    experienceDescription: technician.experienceDescription,
    availabilityStatus: technician.availabilityStatus,
    verificationStatus: technician.verificationStatus,
    averageRating: technician.averageRating,
    totalReviews: technician.totalReviews,
    totalCompletedJobs: technician.totalCompletedJobs,
    services,
    reviews
  };
};
var getAllCategoriesFromDB2 = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return categories;
};
var servicesService = {
  getAllServicesFromDB,
  getAllTechnicianServicesFromDB,
  getAllTechniciansFromDB,
  getTechnicianByIdFromDB,
  getAllCategoriesFromDB: getAllCategoriesFromDB2
};

// src/module/service/services.controller.ts
var getAllServices = catchAsync(async (req, res) => {
  const result = await servicesService.getAllServicesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "All Services retrieved successfully",
    data: result
  });
});
var getAllTechnicianServices = catchAsync(
  async (req, res) => {
    const result = await servicesService.getAllTechnicianServicesFromDB(
      req.query
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus6.OK,
      message: "All Services retrieved successfully",
      data: result
    });
  }
);
var getAllTechnicians = catchAsync(async (req, res) => {
  const result = await servicesService.getAllTechniciansFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "All Technicians retrieved successfully",
    data: result
  });
});
var getTechnicianById = catchAsync(async (req, res) => {
  const result = await servicesService.getTechnicianByIdFromDB(
    req.params.id
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Technician profile retrieved successfully",
    data: result
  });
});
var getAllCategories2 = catchAsync(async (req, res) => {
  const result = await servicesService.getAllCategoriesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "All Categories retrieved successfully",
    data: result
  });
});
var servicesController = {
  getAllServices,
  getAllTechnicianServices,
  getAllTechnicians,
  getTechnicianById,
  getAllCategories: getAllCategories2
};

// src/module/service/services.route.ts
var router5 = Router5();
router5.get("/services/list", authenticate, authorize(USER_ROLE.ADMIN, USER_ROLE.TECHNICIAN), servicesController.getAllServices);
router5.get("/services", servicesController.getAllTechnicianServices);
router5.get("/technicians", servicesController.getAllTechnicians);
router5.get("/technicians/:id", servicesController.getTechnicianById);
router5.get("/categories", servicesController.getAllCategories);
var serviceRoute = router5;

// src/module/booking/booking.route.ts
import { Router as Router6 } from "express";

// src/module/booking/booking.controller.ts
import httpStatus7 from "http-status";

// src/module/booking/booking.service.ts
import { BookingStatus as BookingStatus2 } from "@prisma/client";
var getMyBookingsFromDB2 = async (userId) => {
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: userId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      technicianService: {
        select: {
          price: true,
          pricingType: true,
          estimatedDuration: true,
          service: {
            select: {
              name: true,
              description: true
            }
          },
          technician: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  profileImage: true
                }
              },
              averageRating: true,
              totalReviews: true
            }
          }
        }
      }
    }
  });
  return bookings.map((booking) => ({
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingDate: booking.bookingDate,
    scheduledStart: booking.scheduledStart,
    scheduledEnd: booking.scheduledEnd,
    serviceAddress: booking.serviceAddress,
    totalAmount: booking.totalAmount,
    status: booking.status,
    service: {
      name: booking.technicianService.service.name,
      price: booking.technicianService.price,
      pricingType: booking.technicianService.pricingType
    },
    technician: {
      name: booking.technicianService.technician.user.name,
      phone: booking.technicianService.technician.user.phone,
      profileImage: booking.technicianService.technician.user.profileImage,
      rating: booking.technicianService.technician.averageRating
    }
  }));
};
var getBookingByIdFromDB = async (userId, bookingId) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId: userId
    },
    include: {
      technicianService: {
        include: {
          service: true,
          technician: {
            include: {
              user: true
            }
          }
        }
      },
      payment: true,
      review: true
    }
  });
  if (!booking) {
    throw new Error(
      "Booking not found."
    );
  }
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingDate: booking.bookingDate,
    scheduledStart: booking.scheduledStart,
    scheduledEnd: booking.scheduledEnd,
    serviceAddress: booking.serviceAddress,
    totalAmount: booking.totalAmount,
    status: booking.status,
    notes: booking.notes,
    service: {
      name: booking.technicianService.service.name,
      description: booking.technicianService.service.description,
      price: booking.technicianService.price,
      pricingType: booking.technicianService.pricingType
    },
    technician: {
      id: booking.technicianService.technician.id,
      name: booking.technicianService.technician.user.name,
      phone: booking.technicianService.technician.user.phone,
      profileImage: booking.technicianService.technician.user.profileImage,
      rating: booking.technicianService.technician.averageRating
    },
    payment: booking.payment,
    review: booking.review
  };
};
var createBookingIntoDB = async (userId, payload) => {
  const {
    technicianServiceId,
    bookingDate,
    scheduledStart,
    scheduledEnd,
    serviceAddress,
    latitude,
    longitude,
    notes
  } = payload;
  if (!technicianServiceId || !bookingDate || !scheduledStart || !scheduledEnd || !serviceAddress) {
    throw new Error("Please provide all required fields.");
  }
  if (serviceAddress.trim().length < 10) {
    throw new Error("Service address must be at least 10 characters.");
  }
  const bookingDateObj = new Date(bookingDate);
  const startTime = new Date(scheduledStart);
  const endTime = new Date(scheduledEnd);
  if (isNaN(bookingDateObj.getTime())) {
    throw new Error("Invalid booking date.");
  }
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new Error("Invalid schedule time.");
  }
  if (startTime >= endTime) {
    throw new Error("Scheduled end time must be after start time.");
  }
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDateObj < today) {
    throw new Error("Invalid date. Booking date must be today or in the future.");
  }
  const technicianService2 = await prisma.technicianService.findUnique({
    where: {
      id: technicianServiceId
    },
    include: {
      service: true,
      technician: {
        include: {
          user: true
        }
      }
    }
  });
  if (!technicianService2) {
    throw new Error("Technician service not found.");
  }
  if (technicianService2.status !== "ACTIVE") {
    throw new Error("This service is currently unavailable.");
  }
  if (technicianService2.technician.availabilityStatus !== "ONLINE") {
    throw new Error("Technician is currently unavailable.");
  }
  const existingBooking = await prisma.booking.findFirst({
    where: {
      technicianServiceId,
      bookingDate: bookingDateObj,
      status: {
        in: ["REQUESTED", "ACCEPTED", "CANCELLED"]
      },
      AND: [
        {
          scheduledStart: {
            lt: endTime
          }
        },
        {
          scheduledEnd: {
            gt: startTime
          }
        }
      ]
    }
  });
  if (existingBooking) {
    throw new Error(
      "This technician is already booked for this time slot. Please select another time."
    );
  }
  const customerBooking = await prisma.booking.findFirst({
    where: {
      customerId: userId,
      bookingDate: bookingDateObj,
      status: {
        in: [
          BookingStatus2.REQUESTED,
          BookingStatus2.ACCEPTED,
          BookingStatus2.CANCELLED
        ]
      },
      AND: [
        {
          scheduledStart: {
            lt: endTime
          }
        },
        {
          scheduledEnd: {
            gt: startTime
          }
        }
      ]
    }
  });
  if (customerBooking) {
    throw new Error("You already have a booking during this time slot.");
  }
  const bookingNumber = `BK-${Date.now()}`;
  const booking = await prisma.booking.create({
    data: {
      customerId: userId,
      technicianServiceId,
      bookingNumber,
      bookingDate: bookingDateObj,
      scheduledStart: startTime,
      scheduledEnd: endTime,
      serviceAddress,
      latitude,
      longitude,
      totalAmount: technicianService2.price,
      notes
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true
        }
      },
      technicianService: {
        select: {
          id: true,
          price: true,
          pricingType: true,
          estimatedDuration: true,
          service: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          technician: {
            select: {
              id: true,
              bio: true,
              yearsOfExperience: true,
              availabilityStatus: true,
              averageRating: true,
              totalReviews: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  profileImage: true
                }
              }
            }
          }
        }
      }
    }
  });
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingDate: booking.bookingDate,
    scheduledStart: booking.scheduledStart,
    scheduledEnd: booking.scheduledEnd,
    serviceAddress: booking.serviceAddress,
    latitude: booking.latitude,
    longitude: booking.longitude,
    totalAmount: booking.totalAmount,
    status: booking.status,
    notes: booking.notes,
    customer: booking.customer,
    service: {
      id: booking.technicianService.service.id,
      name: booking.technicianService.service.name,
      description: booking.technicianService.service.description,
      price: booking.technicianService.price,
      pricingType: booking.technicianService.pricingType,
      estimatedDuration: booking.technicianService.estimatedDuration
    },
    technician: {
      id: booking.technicianService.technician.id,
      name: booking.technicianService.technician.user.name,
      phone: booking.technicianService.technician.user.phone,
      profileImage: booking.technicianService.technician.user.profileImage,
      bio: booking.technicianService.technician.bio,
      yearsOfExperience: booking.technicianService.technician.yearsOfExperience,
      availabilityStatus: booking.technicianService.technician.availabilityStatus,
      averageRating: booking.technicianService.technician.averageRating,
      totalReviews: booking.technicianService.technician.totalReviews
    }
  };
};
var bookingService = {
  getMyBookingsFromDB: getMyBookingsFromDB2,
  getBookingByIdFromDB,
  createBookingIntoDB
};

// src/module/booking/booking.controller.ts
var getMyBookings2 = catchAsync(
  async (req, res) => {
    const result = await bookingService.getMyBookingsFromDB(
      req.user.id
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bookings retrieved successfully.",
      data: result
    });
  }
);
var getBookingById = catchAsync(
  async (req, res) => {
    const result = await bookingService.getBookingByIdFromDB(
      req.user.id,
      req.params.id
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Booking details retrieved successfully.",
      data: result
    });
  }
);
var createBookings = catchAsync(async (req, res) => {
  const result = await bookingService.createBookingIntoDB(
    req.user.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "Bookings created successfully.",
    data: result
  });
});
var bookingController = {
  getMyBookings: getMyBookings2,
  getBookingById,
  createBookings
};

// src/module/booking/booking.route.ts
var router6 = Router6();
router6.get(
  "/",
  authenticate,
  bookingController.getMyBookings
);
router6.get(
  "/:id",
  authenticate,
  bookingController.getBookingById
);
router6.post(
  "/",
  authenticate,
  authorize(USER_ROLE.CUSTOMER),
  bookingController.createBookings
);
var bookingRoute = router6;

// src/module/payment/payment.route.ts
import { Router as Router7 } from "express";

// src/module/payment/payment.controller.ts
import httpStatus8 from "http-status";

// src/module/payment/payment.service.ts
import {
  BookingStatus as BookingStatus3,
  PaymentMethod,
  PaymentStatus,
  ServiceStatus as ServiceStatus2
} from "@prisma/client";

// src/lib/stripe.ts
import Stripe from "stripe";
var stripe = new Stripe(config_default.stripe_secret_key);

// src/module/payment/payment.service.ts
var createPaymentSession = async (userId, bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      technicianService: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true
            }
          }
        }
      },
      payment: true
    }
  });
  if (!booking) {
    throw new Error("Booking not found.");
  }
  if (booking.customer.id !== userId) {
    throw new Error("You are not authorized to make payment for this booking.");
  }
  if (booking.status === BookingStatus3.REQUESTED) {
    throw new Error(
      "Payment is not available until technician accepts your booking."
    );
  }
  if (booking.status !== BookingStatus3.ACCEPTED) {
    throw new Error("Payment is only allowed for accepted bookings.");
  }
  if (booking.technicianService.service.status !== ServiceStatus2.ACTIVE) {
    throw new Error("This service is currently unavailable.");
  }
  if (booking.payment && booking.payment.status === PaymentStatus.COMPLETED) {
    throw new Error("This booking has already been paid.");
  }
  if (booking.payment && booking.payment.status === PaymentStatus.PENDING && booking.payment.stripeSessionId) {
    const existingSession = await stripe.checkout.sessions.retrieve(
      booking.payment.stripeSessionId
    );
    if (existingSession.status === "open" && existingSession.url) {
      return {
        checkoutUrl: existingSession.url
      };
    }
  }
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: booking.customer.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "bdt",
          unit_amount: Number(booking.totalAmount) * 100,
          product_data: {
            name: booking.technicianService.service.name,
            description: booking.technicianService.service.description ?? void 0
          }
        }
      }
    ],
    metadata: {
      bookingId: booking.id
    },
    success_url: `${config_default.app_url}/payment/success?bookingId=${booking.id}`,
    cancel_url: `${config_default.app_url}/payment/cancel?bookingId=${booking.id}`
  });
  if (!booking.payment) {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripeSessionId: session.id,
        amount: booking.totalAmount,
        paymentMethod: PaymentMethod.CARD,
        paymentProvider: "STRIPE",
        currency: "BDT",
        status: PaymentStatus.PENDING
      }
    });
  } else {
    await prisma.payment.update({
      where: {
        id: booking.payment.id
      },
      data: {
        stripeSessionId: session.id,
        status: PaymentStatus.PENDING
      }
    });
  }
  return {
    checkoutUrl: session.url
  };
};
var handleWebhook = async (payload, signature) => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config_default.stripe_webhook_secret
  );
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object
      );
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object);
      break;
    default:
      console.log(`No events matched. Unhandled event type ${event.type}.`);
  }
};
var handleCheckoutCompleted = async (session) => {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    throw new Error("Booking ID not found in metadata.");
  }
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        bookingId
      },
      data: {
        transactionId: session.payment_intent,
        paymentMethod: PaymentMethod.CARD,
        status: PaymentStatus.COMPLETED,
        paidAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.booking.update({
      where: {
        id: bookingId
      },
      data: {
        status: BookingStatus3.PAID
      }
    });
  });
};
var handlePaymentFailed = async (paymentIntent) => {
  await prisma.payment.updateMany({
    where: {
      transactionId: paymentIntent.id
    },
    data: {
      status: PaymentStatus.FAILED
    }
  });
};
var handleCheckoutExpired = async (session) => {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    return;
  }
  await prisma.payment.updateMany({
    where: {
      bookingId
    },
    data: {
      status: PaymentStatus.FAILED
    }
  });
};
var getMyPayments = async (userId) => {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId
      }
    },
    include: {
      booking: {
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          bookingDate: true,
          totalAmount: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return payments;
};
var getPaymentById = async (paymentId, userId) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId
    },
    include: {
      booking: {
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          customerId: true,
          bookingDate: true,
          totalAmount: true
        }
      }
    }
  });
  if (payment.booking.customerId !== userId) {
    throw new Error("You are not authorized to access this payment.");
  }
  return payment;
};
var paymentService = {
  createPaymentSession,
  handleWebhook,
  getMyPayments,
  getPaymentById
};

// src/module/payment/payment.controller.ts
var createPaymentSession2 = catchAsync(async (req, res) => {
  const result = await paymentService.createPaymentSession(
    req.user.id,
    req.body.bookingId
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus8.OK,
    message: "Payment session created successfully",
    data: result
  });
});
var handleWebhook2 = catchAsync(async (req, res) => {
  const event = req.body;
  const signature = req.headers["stripe-signature"];
  await paymentService.handleWebhook(event, signature);
  sendResponse(res, {
    statusCode: httpStatus8.OK,
    success: true,
    message: "Webhook Triggered Successfully",
    data: null
  });
});
var getMyPayments2 = catchAsync(async (req, res) => {
  const result = await paymentService.getMyPayments(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus8.OK,
    message: "My Payments retrieved successfully",
    data: result
  });
});
var getPaymentById2 = catchAsync(async (req, res) => {
  const result = await paymentService.getPaymentById(
    req.params.id,
    req.user.id
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus8.OK,
    message: "Payment retrieved successfully",
    data: result
  });
});
var paymentController = {
  createPaymentSession: createPaymentSession2,
  handleWebhook: handleWebhook2,
  getMyPayments: getMyPayments2,
  getPaymentById: getPaymentById2
};

// src/module/payment/payment.route.ts
var router7 = Router7();
router7.post(
  "/checkout-session",
  authenticate,
  authorize(USER_ROLE.CUSTOMER, USER_ROLE.TECHNICIAN, USER_ROLE.ADMIN),
  paymentController.createPaymentSession
);
router7.post("/webhook", paymentController.handleWebhook);
router7.get(
  "/",
  authenticate,
  authorize(USER_ROLE.CUSTOMER),
  paymentController.getMyPayments
);
router7.get(
  "/:id",
  authenticate,
  authorize(USER_ROLE.CUSTOMER),
  paymentController.getPaymentById
);
var paymentRoute = router7;

// src/module/review/review.route.ts
import { Router as Router8 } from "express";

// src/module/review/review.service.ts
import { BookingStatus as BookingStatus4, PaymentStatus as PaymentStatus2 } from "@prisma/client";
var createReviewIntoDB = async (userId, payload) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId
    },
    include: {
      payment: true,
      review: true,
      technicianService: {
        include: {
          technician: true
        }
      }
    }
  });
  if (!booking) {
    throw new Error("Booking not found.");
  }
  if (booking.customerId !== userId) {
    throw new Error(
      "You are not authorized to review this booking."
    );
  }
  if (booking.status !== BookingStatus4.COMPLETED) {
    throw new Error(
      "Review is only allowed after job completion."
    );
  }
  if (!booking.payment || booking.payment.status !== PaymentStatus2.COMPLETED) {
    throw new Error(
      "Payment must be completed before review."
    );
  }
  if (booking.review) {
    throw new Error(
      "Review already exists for this booking."
    );
  }
  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      rating: payload.rating,
      comment: payload.comment
    }
  });
  return review;
};
var reviewService = {
  createReviewIntoDB
};

// src/module/review/review.controller.ts
import httpStatus9 from "http-status";
var createReview = catchAsync(async (req, res) => {
  const result = await reviewService.createReviewIntoDB(
    req.user.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus9.CREATED,
    message: "Review submitted successfully.",
    data: result
  });
});
var reviewController = {
  createReview
};

// src/module/review/review.route.ts
var router8 = Router8();
router8.post(
  "/",
  authenticate,
  authorize(USER_ROLE.CUSTOMER),
  reviewController.createReview
);
var reviewRoute = router8;

// src/app.ts
var app = express();
app.use(cors({
  origin: config_default.app_url,
  credentials: true
}));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Home Service Server is running successfully!",
    author: "Eftajul Islam Shadi"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/users", userRoute);
app.use("/api/technician", technicianRoute);
app.use("/api", serviceRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/reviews", reviewRoute);
app.use(notFound);
app.use(globalErrorHandler);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map