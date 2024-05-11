import { Box, Stack } from "@mui/system";
import { FC } from "react";
import { useCurrentProjectId } from "../store";

const MenuItem: FC<{ text: string; disabled?: boolean }> = ({
  text,
  disabled,
}) => {
  return (
    <Box
      sx={{ cursor: !disabled ? "pointer" : "auto" }}
      color={disabled ? "#888" : "#000"}
    >
      {text}
    </Box>
  );
};

export const ProjectMenuView: FC = () => {
  const [currentProjectId] = useCurrentProjectId();
  return (
    <Stack border="solid 1px #888">
      <MenuItem text="new project" />
      <MenuItem text="delete" disabled={!currentProjectId} />
    </Stack>
  );
};
