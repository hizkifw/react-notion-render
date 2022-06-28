import React, { useMemo } from 'react'
import { ParsedBlock } from '../../..'
import { NotionBlock } from '../../../types/NotionBlock'
import getBlocksToRender from '../../../utils/getBlocksToRender'
import { indexGenerator } from '../../../utils/indexGenerator'

interface Props {
  blocks: NotionBlock[]
  useStyles?: boolean
  classNames?: boolean
  emptyBlocks?: boolean
  slugifyFn?: (text: string) => string
  simpleTitles?: boolean
  customOverrides?: (block: ParsedBlock) => JSX.Element | null
}

function Render({
  blocks,
  classNames,
  emptyBlocks,
  useStyles,
  slugifyFn,
  simpleTitles,
  customOverrides
}: Props) {
  if (!blocks || !blocks.length) return <div />

  const render = useMemo(() => {
    const renderBlocks = getBlocksToRender(blocks)
    const index = indexGenerator(blocks)

    return renderBlocks.map((block) => {
      const overrideComponent = customOverrides?.(block)
      const Component = block.getComponent()

      return overrideComponent ? (
        <React.Fragment key={block.id}>{overrideComponent}</React.Fragment>
      ) : Component ? (
        <Component
          key={block.id}
          classNames={Boolean(classNames)}
          emptyBlocks={emptyBlocks}
          block={block}
          slugifyFn={slugifyFn}
          simpleTitles={simpleTitles}
          index={index}
        />
      ) : null
    })
  }, [blocks])

  return useStyles ? (
    <div className='rnr-container'>{render}</div>
  ) : (
    <React.Fragment>{render}</React.Fragment>
  )
}

export default Render
