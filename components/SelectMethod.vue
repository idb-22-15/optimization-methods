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
  tabClass?: HTMLAttributes['class']
  selectClass?: HTMLAttributes['class']
}>()
const selectedMethod = defineModel<string>('modelValue', { required: true })
</script>

<template>
  <Tabs v-model="selectedMethod" :class="cn('2xl:hidden', props.tabClass)">
    <TabsList>
      <TabsTrigger
        v-for="method in props.methods"
        :key="method.method"
        :value="method.method"
      >
        <h2> {{ method.title }}</h2>
      </TabsTrigger>
    </TabsList>
  </Tabs>

  <Select v-model="selectedMethod" name="select-method ">
    <SelectTrigger :class="cn('hidden w-max 2xl:flex', props.selectClass)">
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
