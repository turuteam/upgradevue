export type UnlayerExporHtml = {
  html: string;
  amp: any;
  chunks: {
    body: string;
    css: string;
    fonts: any[]
    js: string;
  };
}