import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    // Stub RouterView and Toast since App uses vue-router and PrimeVue Toast
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true,
          Toast: true,
        },
      },
    })

    // basic render smoke test
    expect(wrapper.exists()).toBe(true)
  })
})
