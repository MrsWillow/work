const state = {
  fansList: []
}

const mutations = {
  saveFansInfo:(state,val) => {
    state.fansList = val
    // console.log('存储的风机信息',val)

  }
}

export default {
  namespaced: true,
  state,
  mutations,
}
