import Vue from 'vue'

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

Vue.use(ARStyle)
// Vue.use(ARNotification)
Vue.use(ARMediaQuery)
Vue.use(ARBrowser)
Vue.component('ar-icon', ARIcon)
Vue.component('ar-flag-icon', ARFlagIcon)
Vue.component('ar-text', ARText)
Vue.component('ar-state-message', ARStateMessage)
Vue.component('ar-simple-button', ARSimpleButton)
Vue.component('ar-checkbox', ARCheckbox)
Vue.component('ar-link-button', ARLinkButton)
Vue.component('ar-icon-button', ARIconButton)
Vue.component('ar-input', ARInput)
Vue.component('ar-auto-complete-input', ARAutoCompleteInput)
Vue.component('ar-textarea', ARTextarea)
Vue.component('ar-date-input', ARDateInput)
Vue.component('ar-mobile-input', ARMobileInput)
Vue.component('ar-snackbar', ARSnackbar)
Vue.component('ar-field', ARField)
Vue.component('ar-modal', ARModal)
Vue.component('ar-select', ARSelect)
Vue.component('ar-country-select', ARCountrySelect)
Vue.component('ar-state-select', ARStateSelect)
Vue.component('ar-simple-select', ARSimpleSelect)
Vue.component('ar-divider', ARDivider)
Vue.component('ar-simple-form', ARSimpleForm)
Vue.component('ar-skeleton', ARSkeleton)
Vue.component('ar-avatar', ARAvatar)
Vue.component('ar-framed-image', ARFramedImage)
