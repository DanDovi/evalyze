import { Root, Item } from "@radix-ui/react-radio-group";
import styles from "./radioGroupButtons.module.scss";

interface IRadioGroupButtonsProps {
  value?: string | number;
  options: Array<{
    value: string | number;
    label: string;
  }>;
  onChange: (value: string) => void;
}

export const RadioGroupButtons = ({
  value,
  options,
  onChange,
}: IRadioGroupButtonsProps) => (
  <Root
    className={styles.radioGroupButtons}
    value={value?.toString()}
    onValueChange={onChange}
  >
    {options.map((option) => (
      <Item key={option.value} value={option.value.toString()}>
        {option.label}
      </Item>
    ))}
  </Root>
);
