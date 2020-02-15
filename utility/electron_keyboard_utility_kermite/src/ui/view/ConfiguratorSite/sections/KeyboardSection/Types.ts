export interface IKeyUnitCardViewModel {
  keyUnitId: string;
  pos: { x: number; y: number; r: number };
  isPressed: boolean;
  isSelected: boolean;
  assignText: string;
  isExtendedAssign: boolean;
  selectionHandler(): void;
}
