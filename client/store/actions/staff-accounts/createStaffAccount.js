/**
 * CREATE_STAFF_ACCOUNT
 *
 * This is a little different to normal 'signup' as we'll randomly
 * generate the user's password AND we'll update their
 * masqueradeAsOids column if needed.
 */
import { generateHash } from '@/utils/helpers/';

export async function CREATE_STAFF_ACCOUNT({},
{ mobileNumber = "",
  country = "au",
  firstName,
  lastName,
  masqueradeAsOids = [],
  emailAddress,
  promoterOid = null,
  password = null,
}) {
  try {
    // step 1: make a Promoter/PromoterAccount using the signup endpoint
    const accountObj = {
      firstName,
      lastName,
      emailAddress,
      password: password || generateHash(),
      mobileNumber,
      company: `AREP STAFF: ${firstName}'s Test Promoter`,
      country,
    };

    if (promoterOid !== null) {
      accountObj.promoterOid = promoterOid;
    }

    const { data } = await this.$axios.post(`/signup`, accountObj);

    if (!data.account) {
      throw 'Could not create promoter account';
    }

    const promoterAccount = data.account;

    // Step 2: update the promoter account with their masqueradable promoters if applicable
    if (masqueradeAsOids !== null && masqueradeAsOids.length > 0) {
      await this.$axios.patch(`/promoter/${promoterAccount.promoterOid}/account/${promoterAccount.oid}`, {
        masqueradeAsOids
      });
    }

    return promoterAccount;
  } catch (error) {
    // TODO: Notify client
    console.log(error);
    throw error;
  }
}
