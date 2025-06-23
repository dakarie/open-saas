import * as z from 'zod';
import { type UpdateIsUserAdminById, type GetPaginatedUsers, type SubmitKycInfo } from 'wasp/server/operations';
import { type User } from 'wasp/entities';
import { HttpError, prisma } from 'wasp/server';
import { SubscriptionStatus } from '../payment/plans';
import { type Prisma } from '@prisma/client';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

const updateUserAdminByIdInputSchema = z.object({
  id: z.string().nonempty(),
  isAdmin: z.boolean(),
});

type UpdateUserAdminByIdInput = z.infer<typeof updateUserAdminByIdInputSchema>;

export const updateIsUserAdminById: UpdateIsUserAdminById<UpdateUserAdminByIdInput, User> = async (
  rawArgs,
  context
) => {
  const { id, isAdmin } = ensureArgsSchemaOrThrowHttpError(updateUserAdminByIdInputSchema, rawArgs);

  if (!context.user) {
    throw new HttpError(401, 'Only authenticated users are allowed to perform this operation');
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Only admins are allowed to perform this operation');
  }

  return context.entities.User.update({
    where: { id },
    data: { isAdmin },
  });
};

type GetPaginatedUsersOutput = {
  users: Pick<
    User,
    'id' | 'email' | 'username' | 'subscriptionStatus' | 'paymentProcessorUserId' | 'isAdmin'
  >[];
  totalPages: number;
};

const kycInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'), // Expecting YYYY-MM-DD string
  addressStreet: z.string().min(1, 'Street address is required'),
  addressCity: z.string().min(1, 'City is required'),
  addressState: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().min(1, 'Country is required'),
  documentType: z.string().min(1, 'Document type is required'),
  documentIdNumber: z.string().min(1, 'Document ID number is required'),
  documentIssuingCountry: z.string().min(1, 'Issuing country is required'),
  documentExpiryDate: z.string().optional(), // Expecting YYYY-MM-DD string
  documentFrontFileId: z.string().min(1, 'Front document is required'), // This will be the File entity ID
  documentBackFileId: z.string().optional(), // This will be the File entity ID
});

type KycInfoInput = z.infer<typeof kycInfoSchema>;

export const submitKycInfo: SubmitKycInfo<KycInfoInput, User> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Authentication required.');
  }

  const args = ensureArgsSchemaOrThrowHttpError(kycInfoSchema, rawArgs);

  // Convert date strings to Date objects or handle potential errors
  let dobDate: Date | undefined = undefined;
  try {
    dobDate = new Date(args.dateOfBirth);
  } catch (e) {
    throw new HttpError(400, 'Invalid date of birth format.');
  }

  let expiryDate: Date | undefined = undefined;
  if (args.documentExpiryDate) {
    try {
      expiryDate = new Date(args.documentExpiryDate);
    } catch (e) {
      throw new HttpError(400, 'Invalid document expiry date format.');
    }
  }

  const updatedUser = await context.entities.User.update({
    where: { id: context.user.id },
    data: {
      fullName: args.fullName,
      dateOfBirth: dobDate,
      addressStreet: args.addressStreet,
      addressCity: args.addressCity,
      addressState: args.addressState,
      addressPostalCode: args.addressPostalCode,
      addressCountry: args.addressCountry,
      documentType: args.documentType,
      documentIdNumber: args.documentIdNumber,
      documentIssuingCountry: args.documentIssuingCountry,
      documentExpiryDate: expiryDate,
      kycStatus: 'pending_review', // Set status to pending
      kycSubmittedAt: new Date(),
      // Note: Linking files (documentFrontFileId, documentBackFileId) to the User model
      // directly via relation fields like `kycDocumentFront: { connect: { id: args.documentFrontFileId } }`
      // would require those relations to be defined in schema.prisma.
      // For now, we're storing IDs. The admin would use these IDs to find the File records.
      // If we added specific relations like `kycDocumentFrontId: String?` to User, we could store them directly.
      // Or, if File has a userId and purpose, admin can find user's KYC files.
    },
  });
  return updatedUser;
};

const getPaginatorArgsSchema = z.object({
  skipPages: z.number(),
  filter: z.object({
    emailContains: z.string().nonempty().optional(),
    isAdmin: z.boolean().optional(),
    subscriptionStatusIn: z.array(z.nativeEnum(SubscriptionStatus).nullable()).optional(),
  }),
});

type GetPaginatedUsersInput = z.infer<typeof getPaginatorArgsSchema>;

export const getPaginatedUsers: GetPaginatedUsers<GetPaginatedUsersInput, GetPaginatedUsersOutput> = async (
  rawArgs,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Only authenticated users are allowed to perform this operation');
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Only admins are allowed to perform this operation');
  }

  const {
    skipPages,
    filter: { subscriptionStatusIn: subscriptionStatus, emailContains, isAdmin },
  } = ensureArgsSchemaOrThrowHttpError(getPaginatorArgsSchema, rawArgs);

  const includeUnsubscribedUsers = !!subscriptionStatus?.some((status) => status === null);
  const desiredSubscriptionStatuses = subscriptionStatus?.filter((status) => status !== null);

  const pageSize = 10;

  const userPageQuery: Prisma.UserFindManyArgs = {
    skip: skipPages * pageSize,
    take: pageSize,
    where: {
      AND: [
        {
          email: {
            contains: emailContains,
            mode: 'insensitive',
          },
          isAdmin,
        },
        {
          OR: [
            {
              subscriptionStatus: {
                in: desiredSubscriptionStatuses,
              },
            },
            {
              subscriptionStatus: includeUnsubscribedUsers ? null : undefined,
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      isAdmin: true,
      subscriptionStatus: true,
      paymentProcessorUserId: true,
    },
    orderBy: {
      username: 'asc',
    },
  };

  const [pageOfUsers, totalUsers] = await prisma.$transaction([
    context.entities.User.findMany(userPageQuery),
    context.entities.User.count({ where: userPageQuery.where }),
  ]);
  const totalPages = Math.ceil(totalUsers / pageSize);

  return {
    users: pageOfUsers,
    totalPages,
  };
};
