type CounterRecord = {
  key: string
  value: number
}

let globalCounter: CounterRecord | null = null

export const counterRepository = {
  findGlobal() {
    return Promise.resolve(globalCounter)
  },

  createGlobal(value = 0) {
    globalCounter = {
      key: 'global_counter',
      value,
    }

    return Promise.resolve(globalCounter)
  },

  incrementGlobal() {
    const nextValue = (globalCounter?.value ?? 0) + 1
    globalCounter = {
      key: 'global_counter',
      value: nextValue,
    }

    return Promise.resolve(globalCounter)
  },

  updateGlobal(value: number) {
    globalCounter = {
      key: 'global_counter',
      value,
    }

    return Promise.resolve(globalCounter)
  },
}
