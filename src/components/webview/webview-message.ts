export type WebviewMessage = TitleChangeMessage;

type TitleChangeMessage = {
  command: 'title-change';
  title: string;
};
