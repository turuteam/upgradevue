import LeaderLine from 'leader-line-new'

const leaderLinePlugin = (context, inject) => {
  inject('leaderLine', LeaderLine)
}

export default leaderLinePlugin
