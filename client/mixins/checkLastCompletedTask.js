import {mapGetters, mapMutations, mapState} from 'vuex';
export default ({
  computed: {
    ...mapState({
      isFirstLoadCompletedTasksFinished: state => state.promoterTasks.isFirstLoadCompletedTasksFinished,
    }),
    ...mapGetters({
      formattedCompletedTasks: 'promoterTasks/formattedCompletedTasks',
    }),
  },
  watch: {
    formattedCompletedTasks(newTasks, oldTasks) {
      // First case when we recieve completed tasks for the first time
      // Second case when we recieve completed tasks after we already have some
      if ((newTasks.length !== 0 && oldTasks.length === 0 && this.isFirstLoadCompletedTasksFinished === true)
        || (newTasks.length !== 0 && oldTasks.length !== 0 && newTasks[0].startTime !== oldTasks[0].startTime)) {
        this.actionAfterGetCompletedTask();
      }

      // Make flag what we loaded completed tasks for the first time
      if (newTasks.length !== 0 && oldTasks.length === 0) {
        this.SET_FIRST_LOAD_COMPLETED_TASKS(true)
      }
    },
  },
  methods: {
    ...mapMutations({
      SET_FIRST_LOAD_COMPLETED_TASKS: 'promoterTasks/SET_FIRST_LOAD_COMPLETED_TASKS',
    }),
    actionAfterGetCompletedTask () {
    }
  }
})
