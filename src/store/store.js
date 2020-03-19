import Vue from 'vue';
import Vuex from 'vuex';
import data from '../assets/json/data.json';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    data: data
  },
  mutations: {
    SET_LIST(state, payload) {
      state.data = payload;
    },
    SET_CALLED(state, payload) {
      state.called = payload;
    }
  },
  getters: {
    list(state) {
      //This doesn't seem to get called (Not sure what triggers it)
      return state.data;
    }
  },
  actions: {
    setList({ commit }, payload) {
      commit("SET_LIST", payload);
    },
    setCalled({ commit }, payload) {
      commit("SET_CALLED", payload);
    }
  }
});
