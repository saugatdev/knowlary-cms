import type { CollectionConfig } from 'payload';
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished';

export const Horoscopes: CollectionConfig = {
  slug: 'horoscopes',
  access: {
    create: authenticatedOrPublished,
    read: authenticatedOrPublished,
    update: authenticatedOrPublished,
    delete: authenticatedOrPublished,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'sign', 'date', 'startDate', 'endDate'],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
      ],
      defaultValue: 'daily',
    },
    {
      name: 'sign',
      type: 'select',
      required: true,
      options: [
        { label: 'Aries', value: 'aries' },
        { label: 'Taurus', value: 'taurus' },
        { label: 'Gemini', value: 'gemini' },
        { label: 'Cancer', value: 'cancer' },
        { label: 'Leo', value: 'leo' },
        { label: 'Virgo', value: 'virgo' },
        { label: 'Libra', value: 'libra' },
        { label: 'Scorpio', value: 'scorpio' },
        { label: 'Sagittarius', value: 'sagittarius' },
        { label: 'Capricorn', value: 'capricorn' },
        { label: 'Aquarius', value: 'aquarius' },
        { label: 'Pisces', value: 'pisces' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional title for the horoscope entry',
      },
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        description: 'For daily horoscopes, the specific date. Optional for monthly/yearly.',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        condition: (_, siblingData) => siblingData.type === 'weekly',
        description: 'Start date for weekly horoscopes only',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        condition: (_, siblingData) => siblingData.type === 'weekly',
        description: 'End date for weekly horoscopes only',
      },
    },
    {
      name: 'introLetter',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Predefined horoscope introduction/letter for the sign (editable but lockable if needed)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Full horoscope content for this type/sign/date',
      },
    },
    {
      name: 'luckyNumbers',
      type: 'text',
      admin: {
        description: 'Optional: Lucky numbers for the sign',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Optional: Lucky color for the sign',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Optional astrologer/author for this horoscope',
      },
    },
  ],
  timestamps: true,
};
