/**
 * UPDATE_EDITOR_PREFERENCE
 *
 * @param { promoterOid, editor, propertyOid  } context - Store context ( )
 * @todo Handle @throws
 */
export async function UPDATE_EDITOR_PREFERENCE({ }, { promoterOid, editor, propertyOid }) {
  try {
    await this.$api.beefree.updatePromoterEmailEditorSetting(promoterOid, propertyOid, editor);
    return true;
  } catch (error) {
    console.error("Failure to call createPromoterEmailEditorSetting for", promoterOid, "with editor", editor)
    throw error;
  }
}
