export type MessagePreviewState = {
    message: {
        presentation: {
            hideDefaultEmailFooter: boolean,
            templateType: string | null,
            template: object,
        },
        messageBody: {
            previewText: string | null,
        },
        senderName: string | null,
        businessAddress: string | null,
    },
    hash: string | null,
    emailHtml: string | null,
    error: string | null,
};