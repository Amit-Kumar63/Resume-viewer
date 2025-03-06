import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

const ResumeReviewPreview = ({PreviewData}) => {
  return (
    <code>
          <Markdown rehypePlugins={[rehypeHighlight]}>
        {
            PreviewData
        }
    </Markdown>
    </code>
  )
}

export default ResumeReviewPreview