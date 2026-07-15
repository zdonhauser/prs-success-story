export interface Photo {
  id: string
  /** dataURL captured at upload */
  src: string
  /** captured at upload; undefined if the image failed to load then */
  naturalW?: number
  naturalH?: number
  zoom: number
  panX: number
  panY: number
}

export interface AiAnswers {
  situation: string
  response: string
  results: string
}

export interface StoryForm {
  community: string
  coordinator: string
  /** 'YYYY-MM'; either part may be empty mid-selection (see domain/storyDate) */
  date: string
  narrative: string
  /** null = auto-fit to available space */
  narrativeFontSize: number | null
  photos: Photo[]
  photoLayoutIndex: number
  theme: string
  aiAnswers: AiAnswers
}

export type FormFieldUpdater = <K extends keyof StoryForm>(field: K, value: StoryForm[K]) => void

export interface LayoutCell {
  x: number
  y: number
  w: number
  h: number
}

export interface PhotoLayout {
  name: string
  cells: LayoutCell[]
}

export interface CoverRect {
  left: number
  top: number
  width: number
  height: number
}

export interface CropResult {
  zoom: number
  panX: number
  panY: number
}
