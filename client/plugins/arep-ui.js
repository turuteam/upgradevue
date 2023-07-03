// Arep Ui
import ARStyle from 'arep-ui/dist/plugins/ar-style';
// import ARNotification from 'arep-ui/dist/plugins/ARNotification';
import ARMediaQuery from 'arep-ui/dist/plugins/ar-media-query';
import ARBrowser from 'arep-ui/dist/plugins/ar-browser';
import ARIcon from 'arep-ui/dist/components/ARIcon';
import ARFlagIcon from 'arep-ui/dist/components/ARFlagIcon';
import ARText from 'arep-ui/dist/components/ARText';
import ARStateMessage from 'arep-ui/dist/components/ARStateMessage';
import ARSimpleButton from 'arep-ui/dist/components/ARSimpleButton';
import ARCheckbox from 'arep-ui/dist/components/ARCheckbox';
import ARLinkButton from 'arep-ui/dist/components/ARLinkButton';
import ARIconButton from 'arep-ui/dist/components/ARIconButton';
import ARInput from 'arep-ui/dist/components/ARInput';
import ARAutoCompleteInput from 'arep-ui/dist/components/ARAutoCompleteInput';
import ARTextarea from 'arep-ui/dist/components/ARTextarea';
import ARDateInput from 'arep-ui/dist/components/ARDateInput';
import ARMobileInput from 'arep-ui/dist/components/ARMobileInput';
import ARSnackbar from 'arep-ui/dist/components/ARSnackbar';
import ARField from 'arep-ui/dist/components/ARField';
import ARModal from 'arep-ui/dist/components/ARModal';
import ARSelect from 'arep-ui/dist/components/ARSelect';
import ARCountrySelect from 'arep-ui/dist/components/ARCountrySelect';
import ARStateSelect from 'arep-ui/dist/components/ARStateSelect';
import ARSimpleSelect from 'arep-ui/dist/components/ARSimpleSelect';
import ARDivider from 'arep-ui/dist/components/ARDivider';
import ARSimpleForm from 'arep-ui/dist/components/ARSimpleForm';
import ARSkeleton from 'arep-ui/dist/components/ARSkeleton';
import ARAvatar from 'arep-ui/dist/components/ARAvatar';
import ARFramedImage from 'arep-ui/dist/components/ARFramedImage';
import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(ARStyle)
    // vueApp.use(ARNotification)
    vueApp.use(ARMediaQuery)
    vueApp.use(ARBrowser)
    vueApp.component('ar-icon', ARIcon)
    vueApp.component('ar-flag-icon', ARFlagIcon)
    vueApp.component('ar-text', ARText)
    vueApp.component('ar-state-message', ARStateMessage)
    vueApp.component('ar-simple-button', ARSimpleButton)
    vueApp.component('ar-checkbox', ARCheckbox)
    vueApp.component('ar-link-button', ARLinkButton)
    vueApp.component('ar-icon-button', ARIconButton)
    vueApp.component('ar-input', ARInput)
    vueApp.component('ar-auto-complete-input', ARAutoCompleteInput)
    vueApp.component('ar-textarea', ARTextarea)
    vueApp.component('ar-date-input', ARDateInput)
    vueApp.component('ar-mobile-input', ARMobileInput)
    vueApp.component('ar-snackbar', ARSnackbar)
    vueApp.component('ar-field', ARField)
    vueApp.component('ar-modal', ARModal)
    vueApp.component('ar-select', ARSelect)
    vueApp.component('ar-country-select', ARCountrySelect)
    vueApp.component('ar-state-select', ARStateSelect)
    vueApp.component('ar-simple-select', ARSimpleSelect)
    vueApp.component('ar-divider', ARDivider)
    vueApp.component('ar-simple-form', ARSimpleForm)
    vueApp.component('ar-skeleton', ARSkeleton)
    vueApp.component('ar-avatar', ARAvatar)
    vueApp.component('ar-framed-image', ARFramedImage)
})
