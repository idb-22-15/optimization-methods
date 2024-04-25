<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

export interface MethodData {
  method: string
  title: string
}

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  methods: MethodData[]
  class?: HTMLAttributes['class']
}>()
const selectedMethod = defineModel<string>('modelValue', { required: true })
</script>

<template>
  <Select v-model="selectedMethod" name="select-method ">
    <SelectTrigger :class="cn('w-max', props.class)">
      <SelectValue class="w-max" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
          v-for="method in props.methods"
          :key="method.method"
          :value="method.method"
          class="cursor-pointer"
        >
          {{ method.title }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
