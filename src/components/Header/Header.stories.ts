import type { Meta, StoryObj } from '@storybook/react'
import { Header } from './Header'
import '../../i18n/i18n'

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  parameters: { backgrounds: { default: 'dark' } },
}

export default meta
type Story = StoryObj<typeof Header>

export const Default: Story = {}
