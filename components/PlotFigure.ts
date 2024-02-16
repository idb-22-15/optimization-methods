import * as Plot from '@observablehq/plot'
import { h } from 'vue'

export default defineComponent({

  setup(props: { options: Plot.PlotOptions }) {
    const plot = Plot.plot({ ...props.options })
    return {
      plot,
    }
  },
  render() {
    return h('div', {

    })
  },
})
