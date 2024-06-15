
import {
  AuthService,
  IUser,
  IUserContext,
  UsersService
} from '@modules';

class SIOService {
  static readonly INSTANCE_NAME = 'sioService';

  private readonly authService: AuthService;
  private readonly usersService: UsersService;

  constructor (authService: AuthService, usersService: UsersService) {
    this.authService = authService;
    this.usersService = usersService;
  }

  verifyAccessToken (accessToken: string): Promise<IUser> {
    return this.authService.verifyAccessToken(accessToken);
  }

  refreshUserToken (refreshToken: string): Promise<IUserContext> {
    return this.authService.refresh(refreshToken);
  }
}

export default SIOService;
