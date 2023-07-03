
// @ts-ignore
import * as Papa from 'papaparse';
import { NuxtAxiosInstance } from "@nuxtjs/axios";

export default (axios: NuxtAxiosInstance) => ({
  /**
   * Stream CSV
   * @param url
   * @param rows number of rows to download
   * @returns
   */
  async stream(url: string, rows: number): Promise<string> {
    let csvString = '';
    let csvData = null;
    
    if (window.TextDecoderStream) {
      // If browser supports "TextDecoderStream"
      const fetchResponse = await fetch(url);
      if (!fetchResponse.body) {
        throw new Error('Failed to fetch response');
      };
      const reader = fetchResponse.body
        .pipeThrough(new window.TextDecoderStream())
        .getReader();
      // Read csv file chunks, until we get at least 5 contacts
      while (true) {
        const { value, done } = await reader.read();
        csvString += value;
        csvData = Papa.parse(csvString).data;
        if (done || csvData.length >= (rows + 1)) {
          csvData = csvData.slice(0, rows + 1);
          reader.cancel();
          break;
        };
      }
    } else {
      // If browser not supports "TextDecoderStream"
      const { data } = await axios.get(url);
      csvData = Papa.parse(data).data.slice(0, rows + 1);
    }

    // Transfer it back to string
    return Papa.unparse(csvData);
  },
});
