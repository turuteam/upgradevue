

export async function FETCH_PREVIEW_CAMPAIGN({  }, obj) {

  try {
    // POST is not strictly correct, but it allows us to send the campaign data model in the body, which we can't do
    // with a regular GET request. Unfortunately GET requests are now hitting the max character limit, so we need to use
    // this hacky workaround.
    const { data } = await this.$axios.post(
      "/campaign-preview",
      { ...obj }
    );

    return data;

  } catch (error) {
    console.error(error);
    return {};
  }
}
