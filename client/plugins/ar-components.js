import Vue from 'vue';

import Datepicker from '@/components/ui/atoms/datepicker/';
import StepLink from '@/components/ui/atoms/step-link/';

import VideoExternalPicker from '@/components/ui/molecules/video-external-picker/';
import ActionField from '@/components/ui/molecules/field/actionfield';
import { OverviewBar } from '@/components/ui/organisms/overview/';
import Gauge from '@/components/ui/atoms/gauge/';

import VideoUploader from '@/components/ui/organisms/video-uploader/';
import ListView from '@/components/ui/organisms/list-view/';
import IntegrationIndicator from '@/components/ui/atoms/integration-indicator';

/**
 * Automation
 */
import Draggable from '@/plugins/vue-draggable';

/**
 * Fields
 */
import Field from '@/components/fields/field/';

/**
 * Images
 */
import BlurredExcessImage from '@/components/images/blurred-excess-image';

/**
 * Typographies
 */
import Heading from '@/components/typographies/heading/';

/**
 * Forms
 */
import StripeElementForm from '@/components/forms/stripe-element-form';

/**
 * Lists
 */
import CheckList from '@/components/lists/check-list/';
import MessagingListsList from '@/components/lists/messaging-lists-list/';
import InteractiveList from '@/components/lists/interactive-list/';
import TagsList from '@/components/lists/tags-list/';
import ActiveMembershipList from '@/components/lists/active-membership-list/';
import DataList from '@/components/lists/data-list/';

/**
 * Containers
 */
import MobileContainer from '@/components/containers/mobile-container/';
import CardContainer from '@/components/containers/card-container/';

/**
 * Previews
 */
import HtmlPreview from '@/components/previews/html-preview';
import CampaignPreview from '@/components/previews/campaign-preview/';
import TourPreview from '@/components/previews/tour-preview/';
import MediaPreview from '@/components/previews/media-preview/';
import EmailPreview from '@/components/previews/message-previews/email-preview';
import SmsPreview from '@/components/previews/message-previews/sms-preview';
import FacebookMessengerPreview from '@/components/previews/message-previews/facebook-messenger-preview';

/**
 * Inputs
 */
import SlugInput from '@/components/inputs/slug-input';
import NewSlugInput from '@/components/inputs/new-slug-input';
import ColorInput from '@/components/inputs/color-input/';
import Search from '@/components/inputs/search/';
import SliderInput from '@/components/inputs/slider-input/';
import TagInput from '@/components/inputs/tag-input/';
import FanTagInput from '@/components/inputs/fan-tag-input/';
import DateTimeInput from '@/components/inputs/date-time-input/';

/**
 * Switches
 */
import Switch from '@/components/switches/switch/';

/**
 * Steppers
 */
import SimpleStepper from '@/components/steppers/simple-stepper/';

/**
 * Icons
 */
import LoadingBubble from '@/components/icons/loading-bubble/';
import LoadingSpinner from '@/components/icons/loading-spinner/';
import ApexToolbarIcon from '@/components/icons/toolbar-icons/';
import ProviderIcon from '@/components/icons/';

/**
 * Selects
 */
import FieldTypeSelect from '@/components/selects/field-type-select/';
import TimezoneSelect from '@/components/selects/timezone-select/';
import FacebookPageSelect from '@/components/selects/facebook-page-select/';
import MessageListSelect from '@/components/selects/message-list-select/';
import PromoterSelect from '@/components/selects/promoter-select/';
import LanguageSelect from '@/components/selects/language-select/';
import MessageSenderSelect from '@/components/selects/message-sender-select/';
import IntegrationSelect from '@/components/selects/integration-select/';
import NewIntegrationAccountSelect from '@/components/selects/new-integration-account-select/';
import MessageMultiselect from '@/components/selects/message-multiselect';
import EventMultiselect from '@/components/selects/event-multiselect';
import CampaignMultiselect from '@/components/selects/campaign-multiselect';
import ItemMultiselect from '@/components/selects/item-multiselect';
import BrandSelect from '~/components/selects/brand-select';

/**
 * Dropdowns
 */
import DropdownBinder from '@/components/dropdowns/dropdown-binder/';
import EventDropdown from '@/components/dropdowns/event-dropdown/';
import CampaignDropdown from '@/components/dropdowns/campaign-dropdown/';
import TourDropdown from '@/components/dropdowns/tour-dropdown/';
import SplitDropdown from '@/components/dropdowns/split-dropdown/';
import SegmentDropdown from '@/components/dropdowns/segment-dropdown/';
import LinkButtonDropdown from '@/components/dropdowns/link-button-dropdown/';
import IconButtonDropdown from '@/components/dropdowns/icon-button-dropdown/';
import ExpandButtonDropdown from '@/components/dropdowns/expand-button-dropdown/';
import AvatarButtonDropdown from '@/components/dropdowns/avatar-button-dropdown/';
import SimpleButtonDropdown from '@/components/dropdowns/simple-button-dropdown/';
import TimezoneDropdown from '@/components/dropdowns/timezone-dropdown/';
import SelectSearchEventsDropdown from '@/components/dropdowns/select-search-dropdown/SelectSearchEventsDropdown.vue';

/**
 * Prompts
 */
import UnlockPrompt from '@/components/prompts/unlock-prompt';

/**
 * Partials
 */
import Top from '@/components/partials/top/';
import TopCreate from '@/components/partials/top-create/';
import Hero from '@/components/partials/hero';
import Navbar from '@/components/partials/navbar';

/**
 * Sections
 */
import FansControlSection from '@/components/sections/fans-control-section';
import OrdersControlSection from '@/components/sections/order-control-section';
import InsightsSection from '@/components/sections/insights-section';
import NoContentSection from '@/components/sections/no-content-section';
import LoadingSection from '@/components/sections/loading-section';
import IconTitleSection from '@/components/sections/icon-title-section/';
import UpgradePlanSection from '@/components/sections/upgrade-plan-section/';
import PlaygroundSection from '@/components/sections/playground-section/';
import PaymentSourceSection from '@/components/sections/payment-source-section/';
import PurchasesControlSection from '@/components/sections/purchases-control-section';
import TableControlSection from '@/components/sections/table-control-section/TableControlSection';
import MessageListAdvancedTargetingSection from '@/components/sections/message-list-advanced-targeting-section/MessageListAdvancedTargetingSection';
import CharactersLeftCopySection from '@/components/sections/characters-left-copy-section';

/**
 * Cards
 */
import ApiTokenCard from '@/components/cards/api-token-card';
import IntegrationCard from '@/components/cards/integration-card';
import MessagingListCard from '@/components/cards/messaging-list-card';
import CampaignCard from '@/components/cards/campaign-card';
import EventCard from '@/components/cards/event-card';
import TourCard from '@/components/cards/tour-card';
import SignupFormCard from '@/components/cards/signup-form-card';
import ActivityCard from '@/components/cards/activity-card';
import InvoiceCard from '@/components/cards/invoice-card';
import PaymentMethodCard from '@/components/cards/payment-method-card';
import AddOnPlanCard from '@/components/cards/add-on-plan-card';
import BasePlanCard from '@/components/cards/base-plan-card';
import TemplateCard from '@/components/cards/template-card';
import SwitchFieldCard from '@/components/cards/switch-field-card';

/**
 * Tabs
 */
import Tabs from '@/components/tabs/tabs/';
import ButtonGroupTabs from '@/components/tabs/button-group-tabs/';
import OverviewTabs from '@/components/tabs/overview-tabs/';
import ElegantTabs from '@/components/tabs/elegant-tabs/';
import CategoryTabs from '@/components/tabs/category-tabs/';

/**
 * Tags
 */
import Tag from '@/components/tags/tag/';
import SignalTag from '@/components/tags/signal-tag/';
import TendencyTag from '@/components/tags/tendency-tag/';
import GenericTag from '@/components/tags/generic-tag/';

/**
 * Tables
 */
import OrderItemsTable from '@/components/tables/order-items-table/';
import OrdersTable from '@/components/tables/orders-table/';
import PosOrdersTable from '@/components/tables/posOrders-table';
import SubscribersTable from '@/components/tables/subscribers-table/';
import FanTable from '@/components/tables/fan-table/';
import MessagesTable from '@/components/tables/messages-table/';
import PurchasesTable from '@/components/tables/purchases-table/';
import SmallTable from '@/components/tables/small-table/';
import CsvReviewTable from '@/components/tables/csv-review-table/';
import Table from '@/components/tables/table/';
import ZoomAttendanceTable from '@/components/tables/zoom-attendance-table/';
import ClicksStatsTable from '~/components/tables/clicks-stats-table';
import TableHtml from '@/components/tables/table/TableHtml.vue';

/**
 * Buttons
 */
import AvatarButton from '@/components/buttons/avatar-button/';
import LockSimpleButton from '@/components/buttons/lock-simple-button/';
import ExpandIconButton from '@/components/buttons/expand-icon-button/';
import CreateCampaignButton from '@/components/buttons/create-campaign-button';

/**
 * Modals -> General
 */
import MultiSelectModal from '@/components/modals/general/multi-select-modal';
import AskInputModal from '@/components/modals/general/ask-input-modal';
import MultipleButtonModal from '@/components/modals/general/multiple-button-modal';
import SelectDateRangeModal from '@/components/modals/general/select-date-range-modal';
import ResizeImageModal from '@/components/modals/general/resize-image-modal';
import EditPrivacyPolicyModal from '@/components/modals/general/edit-privacy-policy-modal';

/**
 * Modals -> Event Related
 */
import SelectEventsModal from '@/components/modals/event/select-events-modal';
import MergeEventModal from '@/components/modals/event/merge-event-modal';
import CustomFieldModal from '@/components/modals/event/custom-field-modal';
import AdvancedSettingsModal from '@/components/modals/general/advanced-settings-modal';
import CustomDateRangeModal from '@/components/modals/event/custom-date-range-modal';
import OrderDetailsModal from '@/components/modals/event/order-details-modal';
import SelectEventsSection from '@/components/modals/event/select-events-section';

/**
 * Modals -> Campaign Related
 */
import CreateCampaignWidgetWidgetModal from '@/components/modals/campaign/create-campaign-widget-modal';
import CreateEventModal from '@/components/modals/campaign/create-event-modal';
import CampaignSocialActionSettingsModal from '~/components/modals/campaign/campaign-social-action-settings-modal';

/**
 * Modals -> Segment Related
 */
import EditSegmentOrTagModal from '@/components/modals/segment/edit-segment-or-tag-modal';

/**
 * Modals -> Privacy Portal Related
 */
import EditPrivacyPortalModal from '@/components/modals/privacy-portal/edit-privacy-portal-modal';

/**
 * Modals -> Signup Form Related
 */
import ConfirmSignupFormCreationModal from '@/components/modals/signup-form/confirm-signup-form-creation-modal';

/**
 * Modals -> Customer Related
 */
import PurchaseDetailsModal from '@/components/modals/customer/purchase-details-modal';

/**
 * Modals -> Audience Related
 */
import EditFanTagsModal from '@/components/modals/audience/edit-fan-tags-modal';
import FanMassDeleteModal from '@/components/modals/audience/fan-mass-delete-modal';
import AddFanToMessageListModal from '@/components/modals/audience/add-fan-to-message-list-modal';
import FanMassEditModal from '@/components/modals/audience/fan-mass-edit-modal';

/**
 * Modals -> Payment Related
 */
import ManageFacebookPageSubscriptionsModal from '@/components/modals/payment/manage-facebook-page-subscriptions';
import UpdateBillingDetailsModal from '@/components/modals/payment/update-billing-details-modal';
import DirectPurchaseModal from '@/components/modals/payment/direct-purchase-modal';
import AddPaymentMethodModal from '@/components/modals/payment/add-payment-method-modal';
import PurchaseSmsCreditModal from '@/components/modals/payment/purchase-sms-credit-modal';
import ChangePaymentSourceModal from '@/components/modals/payment/change-payment-source-modal';

/**
 * Modals -> Message Related
 */
import MessagePreviewModal from '@/components/modals/message/message-preview-modal';
import ImportDynamicTagsModal from '@/components/modals/message/import-dynamic-tags-modal';
import ImportDynamicTagsSection from '@/components/modals/message/import-dynamic-tags-section';
import SelectDynamicTagsModal from '~/components/modals/message/select-dynamic-tags-modal';
import SelectDynamicTagsSection from '~/components/modals/message/select-dynamic-tags-section';
import SendTestEmailModal from '@/components/modals/message/send-test-email-modal';
import EmailPreviewModal from '@/components/modals/message/email-preview-modal';
import EmailEditorModal from '@/components/modals/message/email-editor-modal';
import ShareableLinkModal from '@/components/modals/message/shareable-link-modal';

/**
 * Modals -> Message List Related
 */
import CreateMessageListModal from '@/components/modals/message-list/create-message-list-modal';
import MessageListSettingsModal from '@/components/modals/message-list/message-list-settings-modal';
import MessageListPreferencesModal from '@/components/modals/message-list/message-list-preferences-modal';

/**
 * Modals -> Message List Related
 */
import MessageSenderModal from '@/components/modals/message-sender/message-sender-modal';

/**
 * Modals -> Message Template Related
 */
import SelectEmailTemplateModal from '@/components/modals/message-template/select-email-template-modal';
import CreateEmailTemplateModal from '@/components/modals/message-template/put-email-template-name-modal';
import SelectEmailTemplateSection from '@/components/modals/message-template/select-email-template-section';

/**
 * Modals -> Integration Related
 */
import AskMoshtixAccessTokenModal from '@/components/modals/integration/ask-moshtix-access-token-modal/';
import AskMemberfulClientCredentialsModal from '@/components/modals/integration/ask-memberful-client-credentials-modal/';
import AskTicketekS3CredentialsModal from '@/components/modals/integration/ask-ticketek-s3-credentials-modal';
import AskEventGeniusAccessTokenModal from '@/components/modals/integration/ask-event-genius-access-token-modal/';
import AskDiceAccessTokenModal from '@/components/modals/integration/ask-dice-access-token-modal/';
import AskShopifyAccessTokenModal from '@/components/modals/integration/ask-shopify-access-token-modal/';
import OptinSettingsModal from '@/components/modals/integration/opt-in-settings-modal';
import SeeTicketsUKModal from '@/components/modals/integration/see-tickets-uk-modal';
import MailchimpModal from '@/components/modals/integration/mailchimp-modal';
import TixrModal from '@/components/modals/integration/tixr-modal';
import HumanitixModal from '@/components/modals/integration/humanitix-modal/';
import TryBookingCredentialsModal from '@/components/modals/integration/ask-try-booking-credentials-modal';

/**
 * Charts
 */
import MultipleBarCharts from '@/components/charts/MultipleBarCharts';
import MultipleColumnCharts from '@/components/charts/MultipleColumnCharts';
import MultipleAreaCharts from '@/components/charts/MultipleAreaCharts';
import MultipleLineCharts from '@/components/charts/MultipleLineCharts';
import MultiplePieCharts from '@/components/charts/MultiplePieCharts';

import ApexAreaChart from '@/components/charts/ApexCharts/ApexAreaChart';
import ApexLineChart from '@/components/charts/ApexCharts/ApexLineChart';
import ApexUtilityChart from '@/components/charts/ApexCharts/ApexUtilityChart';
import AnnotationMarker from '@/components/charts/ApexCharts/AnnotationMarker';

/**
 * Dropzones
 */
import NewDropzone from '@/components/dropzones/dropzone';

/**
 * Skeletons
 */
import TagSkeleton from '@/components/skeletons/tag-skeleton';
import TypographySkeleton from '@/components/skeletons/typography-skeleton';
import HeroSkeleton from '@/components/skeletons/hero-skeleton';
import CardSkeleton from '@/components/skeletons/card-skeleton';

/**
 * Menu
 */
import VerticalMenu from '@/components/menu/vertical';

Vue.component('draggable', Draggable);

/**
 * Filters
 */
import ConditionRenderer from '@/components/filters/ConditionRenderer';
import DesignEmailModal from '~/components/modals/message/design-email-modal';
import PrepareToSendModal from '~/components/modals/message/prepare-to-send-modal';
import AbEmailModal from '~/components/modals/message/ab-email-modal';
import CancelScheduleModal from '~/components/modals/message/cancel-schedule-modal';
import DynamicTagFallbackModal from '~/components/modals/message/dynamic-tag-fallback-modal';

/**
 * Fields
 */
Vue.component('am2-field', Field);

/**
 * Images
 */
Vue.component('am2-blurred-excess-image', BlurredExcessImage);

/**
 * Typographies
 */
Vue.component('am2-heading', Heading);

/**
 * Forms
 */
Vue.component('am2-stripe-element-form', StripeElementForm);

/**
 * Lists
 */
Vue.component('am2-check-list', CheckList);
Vue.component('am2-messaging-lists-list', MessagingListsList);
Vue.component('am2-interactive-list', InteractiveList);
Vue.component('am2-tags-list', TagsList);
Vue.component('am2-active-membership-list', ActiveMembershipList);
Vue.component('am2-data-list', DataList);

/**
 * Containers
 */
Vue.component('am2-mobile-container', MobileContainer);
Vue.component('am2-card-container', CardContainer);

/**
 * Previews
 */
Vue.component('am2-html-preview', HtmlPreview);
Vue.component('am2-campaign-preview', CampaignPreview);
Vue.component('am2-tour-preview', TourPreview);
Vue.component('am2-email-preview', EmailPreview);
Vue.component('am2-media-preview', MediaPreview);
Vue.component('am2-sms-preview', SmsPreview);
Vue.component('am2-facebook-messenger-preview', FacebookMessengerPreview);

/**
 * Inputs
 */
Vue.component('am2-slug-input', SlugInput);
Vue.component('am2-new-slug-input', NewSlugInput);
Vue.component('am2-color-input', ColorInput);
Vue.component('am2-search', Search);
Vue.component('am2-slider-input', SliderInput);
Vue.component('am2-tag-input', TagInput);
Vue.component('am2-fan-tag-input', FanTagInput);
Vue.component('am2-date-time-input', DateTimeInput);

/**
 * Switches
 */
Vue.component('am2-switch', Switch);

/**
 * Steppers
 */
Vue.component('am2-simple-stepper', SimpleStepper);

/**
 * Icons
 */
Vue.component('am2-loading-bubble', LoadingBubble);
Vue.component('am2-loading-spinner', LoadingSpinner);
Vue.component('am2-apex-toolbar-icon', ApexToolbarIcon);
Vue.component('am2-provider-icon', ProviderIcon);

/**
 * Selects
 */
Vue.component('am2-field-type-select', FieldTypeSelect);
Vue.component('am2-timezone-select', TimezoneSelect);
Vue.component('am2-facebook-page-select', FacebookPageSelect);
Vue.component('am2-message-list-select', MessageListSelect);
Vue.component('am2-message-multiselect', MessageMultiselect);
Vue.component('am2-item-multiselect', ItemMultiselect);
Vue.component('am2-event-multiselect', EventMultiselect);
Vue.component('am2-campaign-multiselect', CampaignMultiselect);
Vue.component('am2-promoter-select', PromoterSelect);
Vue.component('am2-language-select', LanguageSelect);
Vue.component('am2-message-sender-select', MessageSenderSelect);
Vue.component('am2-integration-account-select', IntegrationSelect);
Vue.component('am2-brand-select', BrandSelect);
Vue.component('am2-new-integration-account-select', NewIntegrationAccountSelect);

/**
 * Dropdowns
 */
Vue.component('am2-dropdown-binder', DropdownBinder);
Vue.component('am2-event-dropdown', EventDropdown);
Vue.component('am2-campaign-dropdown', CampaignDropdown);
Vue.component('am2-tour-dropdown', TourDropdown);
Vue.component('am2-split-dropdown', SplitDropdown);
Vue.component('am2-segment-dropdown', SegmentDropdown);
Vue.component('am2-link-button-dropdown', LinkButtonDropdown);
Vue.component('am2-icon-button-dropdown', IconButtonDropdown);
Vue.component('am2-expand-button-dropdown', ExpandButtonDropdown);
Vue.component('am2-avatar-button-dropdown', AvatarButtonDropdown);
Vue.component('am2-simple-button-dropdown', SimpleButtonDropdown);
Vue.component('am2-timezone-dropdown', TimezoneDropdown);
Vue.component('am2-select-search-events', SelectSearchEventsDropdown);

/**
 * Sections
 */
Vue.component('am2-fans-control-section', FansControlSection);
Vue.component('am2-order-control-section', OrdersControlSection);
Vue.component('am2-insights-section', InsightsSection);
Vue.component('am2-no-content-section', NoContentSection);
Vue.component('am2-loading-section', LoadingSection);
Vue.component('am2-icon-title-section', IconTitleSection);
Vue.component('am2-upgrade-plan-section', UpgradePlanSection);
Vue.component('am2-playground-section', PlaygroundSection);
Vue.component('am2-payment-source-section', PaymentSourceSection);
Vue.component('am2-purchases-control-section', PurchasesControlSection);
Vue.component('am2-table-control-section', TableControlSection);
Vue.component('am2-message-list-advanced-targeting-section', MessageListAdvancedTargetingSection);
Vue.component('am2-characters-left-copy-section', CharactersLeftCopySection);

/**
 * Cards
 */
Vue.component('am2-api-token-card', ApiTokenCard);
Vue.component('am2-integration-card', IntegrationCard);
Vue.component('am2-messaging-list-card', MessagingListCard);
Vue.component('am2-campaign-card', CampaignCard);
Vue.component('am2-event-card', EventCard);
Vue.component('am2-tour-card', TourCard);
Vue.component('am2-signup-form-card', SignupFormCard);
Vue.component('am2-activity-card', ActivityCard);
Vue.component('am2-invoice-card', InvoiceCard);
Vue.component('am2-payment-method-card', PaymentMethodCard);
Vue.component('am2-add-on-plan-card', AddOnPlanCard);
Vue.component('am2-base-plan-card', BasePlanCard);
Vue.component('am2-template-card', TemplateCard);
Vue.component('am2-switch-field-card', SwitchFieldCard);

/**
 * Partials
 */
Vue.component('am2-top', Top);
Vue.component('am2-top-create', TopCreate);
Vue.component('am2-hero', Hero);
Vue.component('am2-navbar', Navbar);

/**
 * Tabs
 */
Vue.component('am2-tabs', Tabs);
Vue.component('am2-button-group-tabs', ButtonGroupTabs);
Vue.component('am2-overview-tabs', OverviewTabs);
Vue.component('am2-elegant-tabs', ElegantTabs);
Vue.component('am2-category-tabs', CategoryTabs);

/**
 * Tags
 */
Vue.component('am2-signal-tag', SignalTag);
Vue.component('am2-tendency-tag', TendencyTag);
Vue.component('am2-tag', Tag);
Vue.component('am2-generic-tag', GenericTag);

/**
 * Tables
 */
Vue.component('am2-order-items-table', OrderItemsTable);
Vue.component('am2-orders-table', OrdersTable);
Vue.component('am2-pos-orders-table', PosOrdersTable);
Vue.component('am2-subscribers-table', SubscribersTable);
Vue.component('am2-fan-table', FanTable);
Vue.component('am2-messages-table', MessagesTable);
Vue.component('am2-purchases-table', PurchasesTable);
Vue.component('am2-table', Table);
Vue.component('am2-small-table', SmallTable);
Vue.component('am2-csv-review-table', CsvReviewTable);
Vue.component('am2-zoom-attendance-table', ZoomAttendanceTable);
Vue.component('am2-clicks-stats-table', ClicksStatsTable);
Vue.component('am2-table-html', TableHtml);

/**
 * Buttons
 */
Vue.component('am2-expand-icon-button', ExpandIconButton);
Vue.component('am2-lock-simple-button', LockSimpleButton);
Vue.component('am2-avatar-button', AvatarButton);
Vue.component('am2-create-campaign-button', CreateCampaignButton);

/**
 * Modals -> General
 */
Vue.component('am2-multi-select-modal', MultiSelectModal);
Vue.component('am2-ask-input-modal', AskInputModal);
Vue.component('am2-multiple-button-modal', MultipleButtonModal);
Vue.component('am2-select-date-range-modal', SelectDateRangeModal);
Vue.component('am2-resize-image-modal', ResizeImageModal);
Vue.component('am2-edit-privacy-policy-modal', EditPrivacyPolicyModal);

/**
 * Modals -> Event Related
 */
Vue.component('am2-select-events-modal', SelectEventsModal);
Vue.component('am2-merge-event-modal', MergeEventModal);
Vue.component('am2-custom-field-modal', CustomFieldModal);
Vue.component('am2-advanced-settings-modal', AdvancedSettingsModal);
Vue.component('am2-custom-date-range-modal', CustomDateRangeModal);
Vue.component('am2-order-details-modal', OrderDetailsModal);

/**
 * Modals -> Campaign Related
 */
Vue.component('am2-create-campaign-widget-modal', CreateCampaignWidgetWidgetModal);
Vue.component('am2-create-event-modal', CreateEventModal);
Vue.component('am2-campaign-social-action-settings-modal', CampaignSocialActionSettingsModal);

/**
 * Modals -> Segment Related
 */
Vue.component('am2-edit-segment-or-tag-modal', EditSegmentOrTagModal);

/**
 * Modals -> Privacy Portal Related
 */
Vue.component('am2-edit-privacy-portal-modal', EditPrivacyPortalModal);

/**
 * Modals -> Signup Form Related
 */
Vue.component('am2-confirm-signup-form-creation-modal', ConfirmSignupFormCreationModal);

/**
 * Modals -> Customer Related
 */
Vue.component('am2-purchase-details-modal', PurchaseDetailsModal);

/**
 * Modals -> Audience Related
 */
Vue.component('am2-edit-fan-tags-modal', EditFanTagsModal);
Vue.component('am2-fan-mass-delete-modal', FanMassDeleteModal);
Vue.component('am2-add-fan-to-message-list-modal', AddFanToMessageListModal);
Vue.component('am2-fan-mass-edit-modal', FanMassEditModal);

/**
 * Modals -> Payment Related
 */
Vue.component('am2-manage-facebook-page-subscriptions-modal', ManageFacebookPageSubscriptionsModal);
Vue.component('am2-update-billing-details-modal', UpdateBillingDetailsModal);
Vue.component('am2-direct-purchase-modal', DirectPurchaseModal);
Vue.component('am2-add-payment-method-modal', AddPaymentMethodModal);
Vue.component('am2-purchase-sms-credit-modal', PurchaseSmsCreditModal);
Vue.component('am2-change-payment-source-modal', ChangePaymentSourceModal);

/**
 * Modals -> Message Related
 */
Vue.component('am2-message-preview-modal', MessagePreviewModal);
Vue.component('am2-import-dynamic-tags-modal', ImportDynamicTagsModal);
Vue.component('am2-import-dynamic-tags-section', ImportDynamicTagsSection);
Vue.component('am2-select-dynamic-tags-modal', SelectDynamicTagsModal);
Vue.component('am2-select-dynamic-tags-section', SelectDynamicTagsSection);
Vue.component('am2-send-test-email-modal', SendTestEmailModal);
Vue.component('am2-email-preview-modal', EmailPreviewModal);
Vue.component('am2-email-editor-modal', EmailEditorModal);
Vue.component('am2-shareable-link-modal', ShareableLinkModal);
Vue.component('am2-design-email-modal', DesignEmailModal);
Vue.component('am2-prepare-to-send-modal', PrepareToSendModal);
Vue.component('am2-ab-email-modal', AbEmailModal);
Vue.component('am2-cancel-schedule-modal', CancelScheduleModal);
Vue.component('am2-dynamic-tag-fallback-modal', DynamicTagFallbackModal);

/**
 * Modals -> Message List Related
 */
Vue.component('am2-message-list-settings-modal', MessageListSettingsModal);
Vue.component('am2-message-list-preferences-modal', MessageListPreferencesModal);
Vue.component('am2-create-message-list-modal', CreateMessageListModal);

/**
 * Modals -> Message Sender Related
 */
Vue.component('am2-message-sender-modal', MessageSenderModal);

/**
 * Modals -> Message Template Related
 */
Vue.component('am2-select-email-template-modal', SelectEmailTemplateModal);
Vue.component('am2-put-email-template-name-modal', CreateEmailTemplateModal);
Vue.component('am2-select-email-template-section', SelectEmailTemplateSection);
Vue.component('am2-select-events-section', SelectEventsSection);

/**
 * Integrations -> Integration Related
 */
Vue.component('am2-ask-moshtix-access-token-modal', AskMoshtixAccessTokenModal);
Vue.component('am2-ask-memberful-client-credentials-modal', AskMemberfulClientCredentialsModal);
Vue.component('am2-ask-ticketek-s3-credentials-modal', AskTicketekS3CredentialsModal);
Vue.component('am2-ask-event-genius-access-token-modal', AskEventGeniusAccessTokenModal);
Vue.component('am2-ask-dice-access-token-modal', AskDiceAccessTokenModal);
Vue.component('am2-ask-shopify-access-token-modal', AskShopifyAccessTokenModal);
Vue.component('am2-opt-in-settings-modal', OptinSettingsModal);
Vue.component('am2-see-tickets-uk-modal', SeeTicketsUKModal);
Vue.component('am2-mailchimp-modal', MailchimpModal);
Vue.component('am2-tixr-modal', TixrModal);
Vue.component('am2-humanitix-modal', HumanitixModal);
Vue.component('am2-ask-try-booking-credentials-modal', TryBookingCredentialsModal)

/**
 * Charts
 */
Vue.component('am2-multiple-bar-charts', MultipleBarCharts);
Vue.component('am2-multiple-column-charts', MultipleColumnCharts);
Vue.component('am2-multiple-area-charts', MultipleAreaCharts);
Vue.component('am2-multiple-line-charts', MultipleLineCharts);
Vue.component('am2-multiple-pie-charts', MultiplePieCharts);
Vue.component('am2-apex-area-chart', ApexAreaChart);
Vue.component('am2-apex-line-chart', ApexLineChart);
Vue.component('am2-apex-utility-chart', ApexUtilityChart);
Vue.component('am2-apex-annotation-marker', AnnotationMarker);

/**
 * Dropzones
 */
Vue.component('am2-dropzone', NewDropzone);

/**
 * Skeletons
 */
Vue.component('am2-tag-skeleton', TagSkeleton);
Vue.component('am2-typography-skeleton', TypographySkeleton);
Vue.component('am2-hero-skeleton', HeroSkeleton);
Vue.component('am2-card-skeleton', CardSkeleton);

Vue.component('am2-step-link', StepLink);
// We're going to drop ar-IconBase
Vue.component('am2-datepicker', Datepicker);
Vue.component('am2-list-view', ListView);
Vue.component('am2-video-external-picker', VideoExternalPicker);
Vue.component('am2-video-uploader', VideoUploader);
Vue.component('am2-action-field', ActionField);
Vue.component('am2-overview-bar', OverviewBar);
Vue.component('am2-integration-indicator', IntegrationIndicator);
Vue.component('am2-gauge', Gauge);

/**
 * Prompts
 */

Vue.component('am2-unlock-prompt', UnlockPrompt);

/**
 * Filters
 */

Vue.component('am2-filter-condition-renderer', ConditionRenderer);

/**
 * Menu
 */

Vue.component('am2-menu-vertical', VerticalMenu);
