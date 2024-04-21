<script setup lang="ts" generic="A extends object, S extends object">
export type Step = 'initial' | number | 'answer'

const props = defineProps<{
  initialHeaders: string[]
  stepsHeaders: string[]
  answerHeaders: string
  result: {
    answer: A
    stepsData: S[]
  }
}>()

const selectedStep = defineModel('selectedStep')
const selectedStep = defineModel('selectedStep')
</script>

<template>
  <section v-if="result" class="flex flex-col whitespace-nowrap 2xl:col-span-2 xl:col-span-1">
    <RadioGroup class="w-full" :model-value="`${selectedStep}`">
      <Table class="overflow-x-scroll">
        <TableHeader>
          <TableRow>
            <TableHead>Старт</TableHead>
            <TableHead>x<sub>0</sub></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            class="cursor-pointer"
            @click="selectStep('initial')"
          >
            <TableCell><RadioGroupItem value="initial" /></TableCell>
            <TableCell>[{{ x0.x1 }}, {{ x0.x2 }}]</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table class="overflow-x-scroll">
        <TableHeader>
          <TableRow>
            <TableHead>Шаг k</TableHead>
            <TableHead>x<sub>k</sub></TableHead>
            <TableHead>f(x<sub>k</sub>)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="(stepData, i) in result.stepsData"
            :key="stepData.toString()"
            :class="[i === selectedStep ? 'bg-zinc-200' : '']"
            class="cursor-pointer"
            @click="selectStep(i)"
          >
            <TableCell class="space-x-4">
              <RadioGroupItem :id="`step-${i}`" :value="`${i}`" />
              <Label :for="`step-${i}`">{{ stepData.step }}</Label>
            </TableCell>
            <TableCell>[{{ stepData.x.x1 }}, {{ stepData.x.x2 }}]</TableCell>
            <TableCell>{{ stepData.fx }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Результат</TableHead>
            <TableHead>x</TableHead>
            <TableHead>f(x)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            class="cursor-pointer"
            @click="selectStep('answer')"
          >
            <TableCell><RadioGroupItem value="answer" /></TableCell>
            <TableCell>[{{ result.answer.x.x1 }}, {{ result.answer.x.x2 }}]</TableCell>
            <TableCell>{{ result.answer.fx }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </RadioGroup>
  </section>
</template>
