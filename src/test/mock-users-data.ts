import {
  IChangePasswordPayload,
  ICreateUserPayload,
  IRegisterUserReq,
  IUpdateUserPayload
} from '@modules';

export const mockUser: any = {
  _id: 'user-id',
  id: 'user-id',
  email: 'email@email.com',
  username: 'username',
  fullname: 'fullname'
};

export const mockUserWithPassword = {
  ...mockUser,
  // eslint-disable-next-line max-len
  password: '439869c8bb4abb0d5cf0d922073d7830200401a9479c0f72de4b4b6b48ecd11c285df93dfab64468061ab613a3070cb80348abf6ec652db60ab9805705fb7f98'
};

export const mockCreateUserPayload: ICreateUserPayload = {
  username: 'create-username',
  email: 'create-email@email.com',
  password: 'password',
  fullname: 'fullname'
};

export const mockUpdateUserPayload: IUpdateUserPayload = {
  username: 'update-username',
  email: 'update-email@email.com',
  fullname: 'update-fullname'
};

export const mockChangePasswordPayload: IChangePasswordPayload = {
  currentPassword: 'mock-password',
  newPassword: '1MockNewPassword!',
  confirmNewPassword: '1MockNewPassword!'
};

export const mockRegisterUserPayload: IRegisterUserReq = {
  username: 'username',
  email: 'email@email.com',
  fullname: 'fullname',
  password: '1MockPassword!',
  confirmPassword: '1MockPassword!'
};
