import Vue from 'vue'
import { capitalizeFirstLetter, formatInteger } from '@/utils/helpers';

Vue.filter('capitalize', val => capitalizeFirstLetter(val));

Vue.filter('comma-separated', val => formatInteger(val));
