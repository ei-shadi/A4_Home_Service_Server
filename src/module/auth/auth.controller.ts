import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catchAsync";
import { sendResponse } from "../../shared/utils/sendResponse";
import httpStatus from "http-status";
import { authService } from "./auth.service";


const registerUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const user = await authService.registerUserIntoDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: { user }
    })
})


// Login User
// const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

//     const payload = req.body;

//     const {accessToken, refreshToken} = await authService.loginUserIntoDB(payload);

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "User logged in successfully",
//         data: { accessToken, refreshToken }
//     })
// })

export const authController = {
    registerUser,
    // loginUser
}