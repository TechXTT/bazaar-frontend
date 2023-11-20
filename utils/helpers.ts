import { ERRORS } from "./errors";

interface IRegisterUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const validatePassword = (password: string): boolean => {
    if (!password) {
        return false;
    }

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < 8 || !hasLowercase || !hasNumber || !hasUppercase) {
        return false;
    }

    return true;
};

export const validateRegisterUser = (user: IRegisterUser) => {
    if (!user.firstName) return ERRORS.FIRST_NAME_REQUIRED;
    if (!user.lastName) return ERRORS.LAST_NAME_REQUIRED;
    if (!user.email) return ERRORS.EMAIL_REQUIRED;
    if (!user.password) return ERRORS.PASSWORD_REQUIRED;
    if (user.password !== user.confirmPassword) return ERRORS.PASSWORDS_NOT_MATCH;
    if (!validatePassword(user.password)) return ERRORS.PASSWORD_INVALID;
    return null;
}