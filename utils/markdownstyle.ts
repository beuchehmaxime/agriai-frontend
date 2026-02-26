import { StyleSheet } from 'react-native';

export const markdownStyles = StyleSheet.create({
  body: {
    color: '#374151',
    fontSize: 16,
    lineHeight: 24,
  },

  heading1: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },

  heading2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 14,
    marginBottom: 6,
  },

  heading3: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },

  strong: {
    fontWeight: '700',
    color: '#111827',
  },

  em: {
    fontStyle: 'italic',
    color: '#4B5563',
  },

  paragraph: {
    marginBottom: 8,
  },

  bullet_list: {
    marginVertical: 8,
  },

  ordered_list: {
    marginVertical: 8,
  },

  list_item: {
    marginBottom: 6,
  },

  bullet_list_icon: {
    color: '#4ADE80',
  },

  ordered_list_icon: {
    color: '#4ADE80',
  },

  hr: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 16,
  },
});