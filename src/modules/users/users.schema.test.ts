import { validateSchema, ValidationException } from '@utils';
import { ChangePasswordPayloadSchema, UpdateUserPayloadSchema } from '.';
import { mockChangePasswordPayload, mockUpdateUserPayload } from '../../test/mock-users-data';

describe('users-data-transfer-object', () => {
  describe('UpdateProfilePayloadSchema', () => {
    it('should return value when schema is valid', () => {
      expect(validateSchema({
        schema: UpdateUserPayloadSchema,
        payload: mockUpdateUserPayload
      })).toEqual(mockUpdateUserPayload);
      expect(validateSchema({
        schema: UpdateUserPayloadSchema,
        payload: {
          fullname: 'fullname'
        }
      })).toEqual({
        fullname: 'fullname'
      });
    });

    it('should throw validation exception when payload is not valid', () => {
      expect(() => validateSchema({
        schema: UpdateUserPayloadSchema,
        payload: { invalidField: 'invalid field value' }
      })).toThrow(ValidationException);
    });

    it('should throw validation exception when payload is not object', () => {
      expect(() => validateSchema({ schema: UpdateUserPayloadSchema, payload: null })).toThrow(ValidationException);
    });
  });

  describe('ChangePasswordPayloadSchema', () => {
    it('should return value when schema is valid', () => {
      expect(validateSchema({
        schema: ChangePasswordPayloadSchema,
        payload: mockChangePasswordPayload
      })).toEqual(mockChangePasswordPayload);
    });

    it('should throw validation exception when payload is not valid', () => {
      expect(() => validateSchema({
        schema: ChangePasswordPayloadSchema,
        payload: { invalidField: 'invalid field value' }
      })).toThrow(ValidationException);
    });

    it('should throw validation exception when payload is not object', () => {
      expect(() => validateSchema({ schema: ChangePasswordPayloadSchema, payload: null })).toThrow(ValidationException);
    });
  });
});
