/**
 * CREATE_EDITOR_PREFERENCE
 *
 * @param { promoterOid, editor } context - Store context (state, rootstate, dispatch)
 * @todo Handle @throws
 */
export async function CREATE_EDITOR_PREFERENCE({ }, { promoterOid, editor }) {
  try {
    await this.$api.beefree.createPromoterEmailEditorSetting(promoterOid, editor);
    return true;
  } catch (error) {
    console.error("Failure to call createPromoterEmailEditorSetting for", promoterOid, "with editor", editor)
    throw error;
  }
}
