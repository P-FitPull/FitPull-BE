import {
  findUserById,
  findValidUserByPhone,
} from '../repositories/user.repository.js';
import { updateUserById } from '../repositories/user.repository.js';
import { softDeleteUserById } from '../repositories/user.repository.js';
import CustomError from '../utils/customError.js';
import { USER_MESSAGES } from '../constants/messages.js';

export const getUserById = async (userId) => {
  const user = await findUserById(userId);
  if (!user)
    throw new CustomError(404, 'USER_NOT_FOUND', USER_MESSAGES.USER_NOT_FOUND);
  const { id, name, phone, verifiedPhone, balance } = user;
  return { id, name, phone, verifiedPhone, balance };
};

export const updateUserInfo = async (
  userId,
  { name, phone, bankAccount, bankName, accountHolder },
) => {
  const updateData = {};

  const user = await findUserById(userId);

  if (phone && phone !== '00000000000') {
    const duplicate = await findValidUserByPhone(phone);
    if (duplicate && duplicate.id !== userId) {
      throw new CustomError(409, 'PHONE_EXISTS', USER_MESSAGES.PHONE_EXISTS);
    }
    updateData.phone = phone;
    if (user.phone !== phone) {
      updateData.verifiedPhone = false;
    }
  }

  if (name) updateData.name = name;
  if (bankAccount !== undefined) updateData.bankAccount = bankAccount;
  if (bankName !== undefined) updateData.bankName = bankName;
  if (accountHolder !== undefined) updateData.accountHolder = accountHolder;

  const updatedUser = await updateUserById(userId, updateData);
  const {
    id,
    name: updatedName,
    phone: updatedPhone,
    verifiedPhone,
  } = updatedUser;

  return {
    id,
    name: updatedName,
    phone: updatedPhone,
    verifiedPhone,
  };
};

export const deactivateUser = async (userId) => {
  return await softDeleteUserById(userId);
};
