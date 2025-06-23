import { type User } from 'wasp/entities';
import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@prisma/client';
import { getSubscriptionPaymentPlanIds, SubscriptionStatus } from '../../payment/plans';

type MockUserData = Omit<User, 'id'>;

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp` file,
 * seeds the database with mock users via the `wasp db seed` command.
 * For more info see: https://wasp.sh/docs/data-model/backends#seeding-the-database
 */
export async function seedMockUsers(prismaClient: PrismaClient) {
  await Promise.all(generateMockUsersData(50).map((data) => prismaClient.user.create({ data })));
}

function generateMockUsersData(numOfUsers: number): MockUserData[] {
  return faker.helpers.multiple(generateMockUserData, { count: numOfUsers });
}

function generateMockUserData(): MockUserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const subscriptionStatus = faker.helpers.arrayElement<SubscriptionStatus | null>([
    ...Object.values(SubscriptionStatus),
    null,
  ]);
  const now = new Date();
  const createdAt = faker.date.past({ refDate: now });
  const timePaid = faker.date.between({ from: createdAt, to: now });
  const credits = subscriptionStatus ? 0 : faker.number.int({ min: 0, max: 10 });
  const hasUserPaidOnStripe = !!subscriptionStatus || credits > 3;
  const kycStatuses = ["none", "pending_review", "verified", "rejected", "resubmit_required", null];
  const kycStatus = faker.helpers.arrayElement(kycStatuses);
  const kycSubmittedAt = kycStatus && kycStatus !== "none" ? faker.date.past({ refDate: now }) : null;
  const kycReviewedAt = kycStatus === "verified" || kycStatus === "rejected" ? faker.date.between({ from: kycSubmittedAt || createdAt, to: now }) : null;

  return {
    email: faker.internet.email({ firstName, lastName }),
    username: faker.internet.userName({ firstName, lastName }),
    createdAt,
    isAdmin: faker.datatype.boolean(0.1), // 10% chance of being an admin
    credits,
    subscriptionStatus,
    lemonSqueezyCustomerPortalUrl: null,
    paymentProcessorUserId: hasUserPaidOnStripe ? `cus_test_${faker.string.uuid()}` : null,
    datePaid: hasUserPaidOnStripe ? faker.date.between({ from: createdAt, to: timePaid }) : null,
    subscriptionPlan: subscriptionStatus ? faker.helpers.arrayElement(getSubscriptionPaymentPlanIds()) : null,

    // KYC Fields
    kycStatus: kycStatus,
    kycSubmittedAt: kycSubmittedAt,
    kycReviewedAt: kycReviewedAt,
    kycReviewNotes: kycStatus === "rejected" || kycStatus === "resubmit_required" ? faker.lorem.sentence() : null,

    fullName: `${firstName} ${lastName}`,
    dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
    addressStreet: faker.location.streetAddress(),
    addressCity: faker.location.city(),
    addressState: faker.location.state({ abbreviated: true }),
    addressPostalCode: faker.location.zipCode(),
    addressCountry: faker.location.countryCode('alpha-2'),

    documentType: kycStatus && kycStatus !== "none" ? faker.helpers.arrayElement(["passport", "national_id", "drivers_license", null]) : null,
    documentIdNumber: kycStatus && kycStatus !== "none" ? faker.string.alphanumeric(10).toUpperCase() : null,
    documentIssuingCountry: kycStatus && kycStatus !== "none" ? faker.location.countryCode('alpha-2') : null,
    documentExpiryDate: kycStatus && kycStatus !== "none" ? faker.date.future({ years: 5 }) : null,

    interpreterPhoneNumber: faker.helpers.arrayElement([faker.phone.number(), null]),
    preferredLanguage: faker.helpers.arrayElement(['en', 'es', 'fr', null]),
  };
}
