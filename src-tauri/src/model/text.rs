use serde_json::Value;
use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
pub struct TextMark {
    #[serde(rename = "type", default)]
    pub mark_type: String,
    #[serde(default)]
    pub attrs: Option<HashMap<String, String>>,
    #[serde(flatten)]
    pub extra: HashMap<String, Value>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
pub struct TextNode {
    #[serde(rename = "type", default)]
    pub node_type: Option<String>,
    #[serde(default)]
    pub attrs: Option<HashMap<String, Value>>,
    #[serde(default)]
    pub content: Option<Vec<TextNode>>,
    #[serde(default)]
    pub marks: Option<Vec<TextMark>>,
    #[serde(default)]
    pub text: Option<String>,
    #[serde(flatten)]
    pub extra: HashMap<String, Value>,
}

impl TextNode {
    pub fn new(node_type: String) -> Self {
        TextNode {
            node_type: Some(node_type),
            attrs: None,
            content: None,
            marks: None,
            text: None,
            extra: HashMap::new(),
        }
    }

    pub fn new_doc() -> Self {
        let mut node = TextNode::new("doc".to_owned());
        node.content = Some(Vec::new());
        node
    }

    pub fn new_paragraph() -> Self {
        let mut node = TextNode::new("paragraph".to_owned());
        node.content = Some(Vec::new());
        node
    }

    pub fn new_text(text: String) -> Self {
        let mut node = TextNode::new("paragraph".to_owned());
        node.text = Some(text.to_owned());
        node
    }

    pub fn new_reference(id: i32, label: String) -> Self {
        let mut node = TextNode::new("mention".to_owned());
        node.attrs = Some(HashMap::from([
            ("id".to_owned(), id.into()),
            ("label".to_owned(), label.into()),
            ("mentionSuggestionChar".to_owned(), "@".into()),
        ]));
        node
    }

    pub fn is_type(&self, node_type: &str) -> bool {
        self.node_type.is_some() && self.node_type.as_ref().unwrap() == node_type
    }

    pub fn get_attr(&self, key: &str) -> Option<&serde_json::Value> {
        if let Some(attr_values) = &self.attrs {
            return match attr_values.get(key) {
                Some(value) => Some(value),
                None => None,
            };
        }
        None
    }

    pub fn set_attr(&mut self, key: &str, value: serde_json::Value) {
        if self.attrs.is_none() {
            self.attrs = Some(HashMap::new());
        }

        let attrs = self.attrs.as_mut().unwrap();

        attrs.insert(key.to_owned(), value);
    }

    pub fn add_child(&mut self, child: TextNode) -> &mut TextNode {
        if self.content.is_none() {
            self.content = Some(Vec::new());
        }

        let content = self.content.as_mut().unwrap();
        content.push(child);

        content.last_mut().unwrap()
    }
}
