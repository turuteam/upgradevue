import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { EmailTemplate, BeefreeTemplate } from '../../store/modules/emailTemplate/types'
import { isErrorStatus } from '../utils';
import { CustomApiError } from '../types';

const convertBeefreeResponseToEmailTemplate = (data: any): EmailTemplate => {
  return {
    oid: data.oid,
    assetType: 'promoter-saved-email-template',
    sysCtime: data.sysCtime,
    meta: {
      name: data.name,
      description: data.description,
      template: data.template.content,
      templateType: 'beefree',
      version: data.version,
      thumbnailFilename: data.thumbnailFilename,
      thumbnailUrl: data.thumbnailUrl,
      url: data.url,
    },
    sysActivep: data.sysActivep,
    url: data.url,
    filename: data.filename,
    promoterOid: data.promoterOid,
    taskOid: data.taskOid,
    campaignOid: data.campaignOid,
    eventOid: data.eventOid,
    fanOid: data.fanOid,
    tourOid: data.tourOid,
    contentType: "text/html",
    privacyPortalOid: data.privacyPortalOid,
    automationOid: data.automationOid,
    uploadParams: null,
  }
}


const convertBeefreeBucketToCatalogueFormat = (data: any): BeefreeTemplate => {
  return {
    oid: data.oid,
    name: data.name,
    createdAt: new Date(data.sysCtime),
    design: JSON.parse(data.template.content),
    displayMode: 'email',
    folder: null,
    updatedAt: new Date(data.sysMtime),
    thumbnailUrl: data.thumbnailUrl,
    url: data.url,
  }
}

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Export email html from Beefree design json data
   * @param htmlUrl - the s3 url to retrieve the html file
   * @returns
   */
  async exportHtml(htmlUrl: string): Promise<any> {
    try {
      const { data, status } = await axios.get(htmlUrl, { baseURL: '', })

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Export Beefree HTML error',
          message: `Error exporting Beefree HTML`,
          status,
        };
        throw apiError;
      }

      return data;
    } catch (error) {
      throw error
    }
  },
  async generateHtml(
    promoterOid: number,
    templateJson: object,
    previewHtml: string | null,
    footerHtml: string | null,
  ): Promise<any> {
    try {
      const { data, status} = await axios.post(`/promoter/${promoterOid}/beefree-generate-html`, {
        templateJson,
        previewHtml,
        footerHtml
      })

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Generate Beefree HTML error',
          message: `Error generating Beefree HTML`,
          status,
        };
        throw apiError;
      }

      return data
    } catch (error) {
      throw error
    }
  },
  async getTemplates(
    promoterOid: number,
    paramOptions: {
      top: number,
      skip: number
    }
  ): Promise<any> {
    try {
      const { data, status } = await axios.get(`/promoter/${promoterOid}/bucket-email-template`, {
        params: {
          $top: paramOptions?.top || 20,
          $orderby: 'sysCtime desc',
          $select: 'name,description,template,version,meta',
          $count: true,
          $skip: paramOptions?.skip || 0,
        },
      });

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Fetch Beefree templates error',
          message: `Error fetching templates`,
          status,
        };
        throw apiError;
      }

      
      

      // Convert received data to email template structure
      const convertedData = !!data?.rows && data.rows.length > 0 ? data.rows.map((dataRow: any) => {
        return convertBeefreeResponseToEmailTemplate(dataRow)
      }) : []

      const emailTemplates: EmailTemplate[] = convertedData;
      const emailTemplatesCount = convertedData.length;

      return {
        templates: emailTemplates,
        count: emailTemplatesCount,
        templateCount: data.count,
      }
    } catch (error) {
      throw error
    }
  },
  async getTemplate(promoterOid: number, emailTemplateOid: number): Promise<EmailTemplate> {
    try {
      const { data, status } = await axios.get(`/promoter/${promoterOid}/bucket-email-template/${emailTemplateOid}`, {});

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Fetch Beefree template error',
          message: `Error fetching template`,
          status,
        };
        throw apiError;
      }

      // Convert received data to email template structure
      const emailTemplate: EmailTemplate = convertBeefreeResponseToEmailTemplate(data)

      return emailTemplate
    } catch (error) {
      throw error
    }
  },
  async addNewTemplate(promoterOid: number, emailTemplate: any): Promise<EmailTemplate> {
    try {
      const { meta, taskOid, automationOid, previewHtml, footerHtml, } = emailTemplate;
      const { data, status } = await axios.post(`/promoter/${promoterOid}/bucket-email-template/`, {
        name: meta.name,
        description: meta.description,
        template: {
          provider: "beefree",
          content: `${meta.template}`,
          previewHtml: previewHtml || meta.previewHtml,
          footerHtml: footerHtml || meta.footerHtml,
        },
        version: 1,
        taskOid: !!taskOid ? parseInt(taskOid) : null,
        automationOid: !!automationOid ? parseInt(automationOid) : null,
      });

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Add new template error',
          message: `Error adding new template`,
          status,
        };
        throw apiError;
      }

      // Convert received data to email template structure
      const convertedData: EmailTemplate = convertBeefreeResponseToEmailTemplate(data)
      return convertedData;
    } catch (error) {
      throw error
    }
  },
  async updateTemplate(promoterOid: number, emailTemplateOid: number, meta: any, taskOid: number | null, previewHtml: any | null, footerHtml: any | null): Promise<boolean> {
    try {
      if (!emailTemplateOid) {
        return null;
      }

      const { status } = await axios.patch(`/promoter/${promoterOid}/bucket-email-template/${emailTemplateOid}`, {
        name: meta.name,
        description: meta.description,
        template: {
          provider: "beefree",
          content: `${meta.template}`,
          previewHtml,
          footerHtml,
        },
        version: meta.version + 1,
        taskOid: taskOid,
      });

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Update Beefree template error',
          message: `Error updating template`,
          status,
        };
        throw apiError;
      }

      return true;
    } catch (error) {
      throw error
    }
  },
  async initialiseBeefreePlugin(promoterOid: number): Promise<any> {
    try {
      const { data, status } = await axios.get(`/promoter/${promoterOid}/beefree-auth`);

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Authenticating Beefree plugin error',
          message: `Error authenticating Beefree`,
          status,
        };
        throw apiError;
      }

      return {
        ...data,
        access_token: data.accessToken,
        token_type: data.tokenType,
        expires_in: data.expiresIn,
        refresh_token: data.refreshToken,
        "as:client_id": data["as:clientId"]
      };
    } catch (error) {
      throw error
    }
  },
  async deleteTemplate(promoterOid: number, emailTemplateOid: number): Promise<any> {
    try {
      const { status } = await axios.$delete(`/promoter/${promoterOid}/bucket-email-template/${emailTemplateOid}`);

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Fetching Beefree catalogue templates error',
          message: `Error fetching Beefree catalogue templates`,
          status,
        };
        throw apiError;
      }

      return true
    } catch (error) {
      throw error
    }
  },
  async getCatalogueTemplates(
    promoterOid: number,
    paramOptions: {
      top: number,
      skip: number
    }
  ): Promise<any> {
    try {
      const { data, status } = await axios.get(`/promoter/${promoterOid}/bucket-email-template`, {
        params: {
          $top: paramOptions?.top || 20, // Prevent top to be zero and also set default to 20
          $orderby: 'sysCtime desc',
          $select: 'name,description,template,version,meta',
          $count: true,
          $skip: paramOptions?.skip || 0,
          $source: 'catalogue',
        },
      });

      if (isErrorStatus(status)) {
        const apiError: CustomApiError = {
          name: 'Fetching Beefree catalogue templates error',
          message: `Error fetching Beefree catalogue templates`,
          status,
        };
        throw apiError;
      }

      // Convert received data to email template structure
      const convertedData = !!data?.rows && data.rows.length > 0 ? data.rows.map((dataRow: any) => {
        return convertBeefreeBucketToCatalogueFormat(dataRow)
      }) : []

      const emailTemplates: EmailTemplate[] = convertedData;
      const emailTemplatesCount = data.count;

      return {
        templates: emailTemplates,
        count: emailTemplatesCount,
      }
    } catch (error) {
      throw error
    }
  },
  async getCatalogueTemplate(
    promoterOid: number,
    emailTemplateOid: number,
  ): Promise<any> {
    try {
      const { data } = await axios.get(`/promoter/${promoterOid}/bucket-email-template/${emailTemplateOid}`);
      return convertBeefreeBucketToCatalogueFormat(data);
    } catch (error) {
      throw error
    }
  },
  async updatePromoterEmailEditorSetting(
    promoterOid: number,
    propertyOid: number | null,
    editor: string,
  ): Promise<any> {
    try {
      const url = `/promoter/${promoterOid}/property/${propertyOid}`
      const { data } = await axios.patch(url, { property: editor });
      return data
    } catch (err) {
      throw err
    }
  },
  async createPromoterEmailEditorSetting(
    promoterOid: number,
    editor: string,
  ): Promise<any> {
    try {
      const url = `/promoter/${promoterOid}/property`
      const { data } = await axios.post(url, {
        property: editor,
        type: 'promoter-email-editor',
        promoterOid
      });
      return data
    } catch (err) {
      throw err
    }
  },
  async getPromoterEmailEditorSetting(
    promoterOid: number,
  ): Promise<any> {
    try {
      const { data } = await axios.get(`/promoter/${promoterOid}/property`, {
        params: {
          $filter: `promoter-oid=${promoterOid} AND type=promoter-email-editor`,
          $orderby: 'sysMtime desc',
        }
      });

      // Would return an array, and we only need to get the first one if there is any
      if (data.length > 0) {
        return data[0]
      }

      return null
    } catch (err) {
      throw err
    }
  },
});
