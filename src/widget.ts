import { Widget } from '@lumino/widgets';
import { MainAreaWidget, ToolbarButton } from '@jupyterlab/apputils';
import {
  imageIcon, refreshIcon
} from '@jupyterlab/ui-components';
import { requestAPI } from './request';

class ImageCaptionWidget extends Widget {
  // Static counter to track widget instances
  private static instanceCount = 0;

  // Initialization
  constructor() {
    super();

    // Increment the instance counter
    ImageCaptionWidget.instanceCount++;

    // Create and append an HTML <p> (paragraph) tag to our widget's node in
    // the HTML document
    const hello = document.createElement('p');
    const timestamp = new Date().toLocaleTimeString();
    hello.innerHTML = `Howdy JimX! Widget #${ImageCaptionWidget.instanceCount} created at ${timestamp}`;
    this.node.appendChild(hello);
    const center = document.createElement('center');
    this.node.appendChild(center);

    // Put an <img> tag into the <center> tag, and also save it as a class
    // attribute so we can update it later.
    this.img = document.createElement('img');
    center.appendChild(this.img);

    // Do the same for a caption!
    this.caption = document.createElement('p');
    center.appendChild(this.caption);

    // Track the current image filename
    this.currentImageId = null;

    // Initialize the image from the server extension
    this.load_image();
  }

  // Fetch data from the server extension and save the results to img and
  // caption class attributes
  load_image(): void {
    // Build the URL with current image ID parameter if we have one
    let endpoint = 'random-image-caption';
    if (this.currentImageId) {
      endpoint += `?current_id=${encodeURIComponent(this.currentImageId)}`;
    }

    requestAPI<any>(endpoint)
      .then(data => {
        console.log(data);
        this.img.src = `data:image/jpeg;base64, ${data.b64_bytes}`;
        this.caption.innerHTML = data.caption;
        // Store the new image ID for future requests
        this.currentImageId = data.filename;
      })
      .catch(reason => {
        console.error(`Error fetching image data.\n${reason}`);
      });
  }

  // Information about class attributes for the type checker
  img: HTMLImageElement;
  caption: HTMLParagraphElement;
  currentImageId: string | null;
}

export class ImageCaptionMainAreaWidget extends MainAreaWidget<ImageCaptionWidget> {
  constructor() {
    const widget = new ImageCaptionWidget();
    super({ content: widget });

    this.title.label = "Jim's image with caption";
    this.title.caption = this.title.label;
    this.title.icon = imageIcon;

    // Add a refresh button to the toolbar
    const refreshButton = new ToolbarButton({
      icon: refreshIcon,
      tooltip: 'Refresh image',
      onClick: () => {
        widget.load_image();
      }
    });
    this.toolbar.addItem('refresh', refreshButton);
  }
}
