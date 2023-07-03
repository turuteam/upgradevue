import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { UnlayerExporHtml } from './types';
import { generateRegisterInsertEventToolScript }  from '@/components/editors/unlayer-email-editor/utils/insert-event-utils/index';

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Export email html from Unlayer design json data
   * @param promoterOid 
   * @param eventOid 
   * @returns
   */
  async exportHtml(unlayerDesign: object): Promise<UnlayerExporHtml> {
    const base64Auth = btoa(`${process.env.arUnlayerApiKey}:`);
    // @ts-ignore
    const { data }: { data: { status: boolean, data: UnlayerExporHtml } } = await axios.mono.post(
      'https://api.unlayer.com/v2/export/html',
      {
        displayMode: 'email',
        design: unlayerDesign,
        mergeTags: {},
        customJS: [
          generateRegisterInsertEventToolScript(),
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64Auth}`,
        },
      },
    );
    return data.data;
  },
});