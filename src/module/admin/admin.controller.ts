import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/utils/catchAsync";
import { sendResponse } from "../../shared/utils/sendResponse";
import { adminService } from "./admin.service";

// Get All Users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllUsersFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Users retrieved successfully.",
    data: result,
  });
})

// Get All Bookings
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllBookingsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Bookings retrieved successfully.",
    data: result,
  });
})

// Get All Categories
const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllCategoriesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Categories retrieved successfully.",
    data: result,
  });
}) 

// Update User Status
const updateUserStatus = catchAsync(async (req, res) => {
  const result = await adminService.updateUserStatusIntoDB(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully.",
    data: result,
  });
});

// Update Category
const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateCategoryIntoDB(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category updated successfully.",
    data: result,
  });
});

export const adminController = {
  getAllUsers,
  getAllBookings,
  getAllCategories,
  updateUserStatus,
  updateCategory,
};