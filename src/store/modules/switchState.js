const state = {
  switchState: true
}

const mutations = {
  getSwitchState:(state,val) =>{
    state.switchState = val
    console.log(val)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
}
