import { Root, Item } from "@radix-ui/react-radio-group";
import styles from "./radioGroupButtons.module.scss";

interface IRadioGroupButtonsProps {
  options: Array<{
    value: string | number;
    label: string;
  }>;
  onChange: (value: string) => void;
}

export const RadioGroupButtons = ({
  options,
  onChange,
}: IRadioGroupButtonsProps) => (
  <Root onValueChange={onChange} className={styles.radioGroupButtons}>
    {options.map((option) => (
      <Item key={option.value} value={option.value.toString()}>
        {option.label}
      </Item>
    ))}
  </Root>
);
