import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";
import config from "../../config";
import { USER_ROLE } from "./auth.constant";
import { SignOptions } from "jsonwebtoken";
import { jwtUtils } from "../../shared/utils/jwt";

const registerUserIntoDB = async (payload: IRegisterUserPayload) => {
  const { name, email, phone, password, role } = payload;

  // TODO: Validate the Password strength and format
  // TODO: Validate the email format and also send error msg separately for email
  // TODO: Validate the phone number format and also send error msg separately for phone number

  // Check if all required fields are present
  if (!name || !email || !phone || !password || !role) {
    throw new Error(
      "Please provide all required fields: name, email, phone, password, and role",
    );
  }

  // Check existing user by email or phone
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  // If user already exists, throw an error
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Check if the password meets the minimum length requirement
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Normalize the role
  const normalizedRole = payload.role.trim().toUpperCase();

  // Check if the role is valid
  if (
    normalizedRole !== USER_ROLE.CUSTOMER &&
    normalizedRole !== USER_ROLE.TECHNICIAN
  ) {
    throw new Error("Invalid role");
  }

  // Check if the role exists in the database
  const roleData = await prisma.role.findUnique({
    where: {
      name: normalizedRole,
    },
  });

  // If the role does not exist, throw an error
  if (!roleData) {
    throw new Error("Role not found");
  }

  // Hash the password before storing it in the database
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  // Create the user
  const user = await prisma.user.create({
    data: {
      roleId: roleData.id,
      name,
      email,
      phone,
      passwordHash: hashedPassword,
    },
    omit: {
      passwordHash: true,
    },
  });

  return user;
};

// Login User Into DB
const loginUserIntoDB = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  // Check if email and password are provided
  if (!email || !password) {
    throw new Error("Please provide both email and password");
  }

  // Find the user by email
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  // If user Status is Banned, throw an error
  if (user.status === "BANNED") {
    throw new Error(
      "Sorry, your account has been banned. Please contact support for assistance.",
    );
  }

  // Users Role Validation
  const roleData = await prisma.role.findUnique({
    where: {
      id: user.roleId,
    },
  });

  // If the user role does not exist, throw an error
  if (!roleData) {
    throw new Error("User role not found");
  }

  // Compare the provided password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // JWT token generation Logic
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleData.name,
  };

  // Generate JWT Access Token
  const accessToken = jwtUtils.createToken(
    jwtPayload, 
    config.jwt_access_secret, 
    config.jwt_access_expires_in as SignOptions);

  // Generate JWT Refresh Token
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions
  );

  return {
    accessToken,
    refreshToken
  };
};

export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
};
