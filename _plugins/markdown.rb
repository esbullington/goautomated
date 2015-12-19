
module Jekyll
  class MarkdownBlock < Liquid::Block
    def initialize(tag_name, text, tokens)
      super
    end
    require "kramdown"
    def render(context)
      content = super
      "#{Kramdown::Document.new(content, :parse_block_html => true).to_html}"
    end
  end
end

Liquid::Template.register_tag('markdown', Jekyll::MarkdownBlock)

module Jekyll
  class MarkdownTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @text = text.strip
    end
    require "kramdown"
    def render(context)
      tmpl = File.read File.join Dir.pwd, "_includes", @text
      site = context.registers[:site]
      tmpl = (Liquid::Template.parse tmpl).render site.site_payload
      html = Kramdown::Document.new(tmpl, :parse_block_html => true).to_html
    end
  end
end
Liquid::Template.register_tag('include_markdown', Jekyll::MarkdownTag)
