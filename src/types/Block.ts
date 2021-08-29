import DummyText from '../components/common/DummyText'
import Embed from '../components/common/Embed/wrappedEmbed'
import File from '../components/common/File'
import List from '../components/common/List'
import Paragraph from '../components/common/Paragraph'
import Title from '../components/common/Title'
import Video from '../components/common/Video/wrappedVideo'
import { blockEnum } from './BlockTypes'
import { NotionBlock } from './NotionBlock'
import Text from './Text'

export class ParsedBlock {
  id: string
  notionType: blockEnum
  items: ParsedBlock[] | null
  content: null | {
    text: Text[]
    checked?: boolean
    caption?: Text[]
    type?: 'external' | 'file'
    external?: {
      url: string
    }
    file?: {
      url: string
    }
    url?: string
  }

  constructor(initialValues: NotionBlock, isChild?: boolean) {
    const notionType = initialValues.type as blockEnum
    const content = initialValues[notionType]

    if (!notionType || !content) return

    this.id = initialValues.id
    this.notionType = notionType

    if (initialValues.type === blockEnum.TITLE && 'title' in initialValues) {
      this.items = null
      this.content = { text: initialValues.title }
    } else if (this.isList() && !isChild) {
      this.content = null
      this.items = [new ParsedBlock(initialValues, true)]
    } else {
      const { text, checked, caption, type, external, file, url } = content

      this.items =
        content.children?.map(
          (child: NotionBlock) => new ParsedBlock(child, true)
        ) ?? null
      this.content = {
        text: text ?? [],
        checked,
        caption,
        type,
        external,
        file,
        url
      }
    }
  }

  getComponent() {
    switch (this.notionType) {
      case blockEnum.PARAGRAPH: {
        return Paragraph
      }
      case blockEnum.HEADING1:
      case blockEnum.HEADING2:
      case blockEnum.HEADING3: {
        return Title
      }
      case blockEnum.DOTS_LIST:
      case blockEnum.ENUM_LIST:
      case blockEnum.CHECK_LIST:
      case blockEnum.TOGGLE_LIST: {
        return List
      }
      case blockEnum.VIDEO: {
        return Video
      }
      case blockEnum.FILE: {
        return File
      }
      case blockEnum.EMBED: {
        return Embed
      }
      case blockEnum.TITLE: {
        return DummyText
      }
      default: {
        return null
      }
    }
  }

  getUrl() {
    if (!this.content) return null

    let url = null

    if (this.isEmbed()) {
      url = this.content.url
    } else if (this.isMedia() && this.content?.type) {
      url = this.content[this.content.type]?.url
    }

    return url || null
  }

  getType() {
    switch (this.notionType) {
      case blockEnum.TOGGLE_LIST:
      case blockEnum.DOTS_LIST:
      case blockEnum.CHECK_LIST:
      case blockEnum.ENUM_LIST:
        return 'LIST'
      case blockEnum.HEADING1:
      case blockEnum.HEADING2:
      case blockEnum.HEADING3:
        return 'TITLE'
      case blockEnum.FILE:
      case blockEnum.VIDEO:
      case blockEnum.IMAGE:
      case blockEnum.PDF:
      case blockEnum.EMBED:
        return 'MEDIA'
      default:
        return 'ELEMENT'
    }
  }

  getPlainText() {
    const textComponent = this.isMedia()
      ? this.content?.caption
      : this.content?.text

    return textComponent?.map((text: Text) => text.plain_text).join(' ') ?? ''
  }

  isList() {
    return this.getType() === 'LIST'
  }

  isTitle(): unknown {
    return this.getType() === 'TITLE'
  }

  isMedia(): unknown {
    return this.getType() === 'MEDIA'
  }

  isEmbed(): unknown {
    return this.getType() === 'MEDIA' && this.notionType === blockEnum.EMBED
  }

  equalsType(type: blockEnum) {
    return this.notionType === type
  }

  addItem(block: NotionBlock) {
    if (!this.items) this.items = []

    this.items.push(new ParsedBlock(block, true))
  }
}
