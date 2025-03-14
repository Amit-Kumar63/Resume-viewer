import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import remarkGfm from 'remark-gfm'

const ResumeReviewPreview = ({PreviewData}) => {

  return (
    <pre>
      <code className={`text-xl max-lg:text-lg text-wrap ${PreviewData?.length > 100 ? 'text-white': 'text-red-600'}`}>
          <Markdown remarkPlugins={[[remarkGfm, {singleTilde: false}]]} children={
            PreviewData
          }/>
    </code>
    </pre>
  )
}

export default ResumeReviewPreview