import { HttpError } from 'wasp/server';
import { type User } from 'wasp/entities';
import { type ReviewKycSubmission } from 'wasp/server/operations';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from './validation'; // Assuming this utility exists as used elsewhere

const reviewKycSubmissionInputSchema = z.object({
  userId: z.string().nonempty(),
  newStatus: z.enum(['verified', 'rejected', 'resubmit_required']), // Added 'resubmit_required'
  reviewNotes: z.string().optional(),
});

type ReviewKycSubmissionInput = z.infer<typeof reviewKycSubmissionInputSchema>;

export const reviewKycSubmission: ReviewKycSubmission<ReviewKycSubmissionInput, User> = async (
  rawArgs,
  context
) => {
  if (!context.user || !context.user.isAdmin) {
    throw new HttpError(403, 'User is not authorized to perform this action.');
  }

  const { userId, newStatus, reviewNotes } = ensureArgsSchemaOrThrowHttpError(
    reviewKycSubmissionInputSchema,
    rawArgs
  );

  const targetUser = await context.entities.User.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new HttpError(404, 'Target user not found.');
  }

  const updatedUser = await context.entities.User.update({
    where: { id: userId },
    data: {
      kycStatus: newStatus,
      kycReviewedAt: new Date(),
      kycReviewNotes: reviewNotes || null,
    },
  });

  if (newStatus === 'verified' && !targetUser.interpreterPhoneNumber) {
    console.log(
      `KYC approved for user ${userId}. User does not have an interpreter phone number. ` +
      `TODO: Trigger phone number assignment process here.`
    );
    // Placeholder for actual phone number assignment logic:
    // try {
    //   const assignedNumber = await assignPhoneNumberToUser(userId, context); // Hypothetical function
    //   if (assignedNumber) {
    //     console.log(`Successfully assigned phone number ${assignedNumber} to user ${userId}`);
    //   } else {
    //     console.error(`Failed to assign phone number to user ${userId} after KYC verification.`);
    //     // Potentially set a flag or notify admins to manually intervene
    //   }
    // } catch (error) {
    //   console.error(`Error during phone number assignment for user ${userId}:`, error);
    // }
  }

  return updatedUser;
};

// Hypothetical function for assigning phone number - not fully implemented
// async function assignPhoneNumberToUser(userId: string, context: any): Promise<string | null> {
//   console.log(`Attempting to assign phone number to user ${userId} via telephony provider API...`);
//   // 1. Choose a telephony provider (e.g., Twilio).
//   // 2. Use their API to search for and provision a number.
//   //    - const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
//   //    - const availableNumbers = await client.availablePhoneNumbers('US').local.list({ areaCode: '510', limit: 1 });
//   //    - if (!availableNumbers.length) { console.error('No numbers available'); return null; }
//   //    - const numberToProvision = availableNumbers[0].phoneNumber;
//   //    - const provisionedNumber = await client.incomingPhoneNumbers.create({ phoneNumber: numberToProvision });
//   //    - await context.entities.User.update({ where: { id: userId }, data: { interpreterPhoneNumber: provisionedNumber.phoneNumber }});
//   //    - return provisionedNumber.phoneNumber;
//   return null; // Placeholder
// }
