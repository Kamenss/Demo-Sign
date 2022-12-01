import { BaseExampleAutoHidingHeaderComponent } from '../helpers/BaseExampleAutoHidingHeaderComponent';
import { processColor, View, Linking } from 'react-native';
import fileSystem from 'react-native-fs';
import PSPDFKitView from 'react-native-pspdfkit';
import React from 'react';
import {
  exampleDocumentPath,
  pspdfkitColor,
  exampleDocumentName,
  writableDocumentPath
} from '../configuration/Constants';
import { hideToolbar } from '../helpers/NavigationHelper';
import { PSPDFKit } from '../helpers/PSPDFKit';

function getPath(fileName) {
  return 'file://' + fileSystem.DocumentDirectoryPath + '/' + fileName;
}

export class PSPDFKitViewComponent extends BaseExampleAutoHidingHeaderComponent {
  pdfRef = null;

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.pdfRef = React.createRef();

    hideToolbar(navigation);

    navigation.addListener('beforeRemove', e => {
      this.pdfRef?.current?.destroyView();
    });
  }

  componentWillUnmount() {
    const { navigation } = this.props;
    navigation.removeListener('beforeRemove');
  }

  async onDocumentSaved(pdfRef) {
    console.log(pdfRef);
    console.log('onDocumentSaved');
    try {
      const formData = new FormData();
      var obj = {
        name: exampleDocumentName,
        type: 'application/pdf',
        uri: getPath(exampleDocumentName),
      };
      // Ensure that the path to the new document is a writable document path
      // You can use a React Native package like https://github.com/rnmods/react-native-document-picker to allow users of your application to select the path and the file name for the new document
      const newDocumentPath =
        fileSystem.DocumentDirectoryPath + exampleDocumentName;
      // Delete the document if it already exists in that path.
      fileSystem
        .exists(newDocumentPath)
        .then(exists => {
          if (exists) {
            fileSystem.unlink(newDocumentPath);
          }
        })
        // First, save all annotations in the current document.
        .then(() => {
          console.log("Save annotations");
          console.log(this.pdfRef);
          this.pdfRef.current
            .saveCurrentDocument()
            .then((saved) => {
              // Then, embed all the annotations
              console.log("Save embed all the annotations");
              PSPDFKit.processAnnotations(
                'embed',
                'all',
                writableDocumentPath,
                newDocumentPath,
              )
                .then(async (success) => {
                  if (success) {
                    alert(`Document saved as ${newDocumentPath}`);
                    var newObj = Object.assign({}, obj, { 'uri': newDocumentPath });
                    Linking.openURL(newDocumentPath);
                    formData.append('file', newObj);
                    let url = `https://administrator.lifetek.vn:203/api/save-file`;
                    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjJlNGFiYWUzNzk1Zjg0OTYyNzFlMjgzIiwidXNlcm5hbWUiOiJ0b25nZ2lhbWRvY2hhZG8iLCJpYXQiOjE2Njk1NjQ2ODl9.6gSR5SqO3lCJMONkEhlVu9ZfxkxOJ95yxI4tLbRF4Ss"
                    const head = {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'multipart/form-data',
                        // Authorization: `Bearer ${token}`,
                      },
                      body: formData,
                    };
                    console.log(formData, obj);
                    const res = await fetch(url, head);

                    console.log(res, 'res');
                    return res;
                  } else {
                    alert('Failed to save document');
                  }
                })
                .catch(error => {
                  alert(JSON.stringify(error));
                });
            })
            .catch(error => {
              console.log("Has error: ", error.toString())
              alert(JSON.stringify(error));
            });
        });
    } catch (error) {
      console.log(error, 'error');
    }
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.flex}>
        <PSPDFKitView
          ref={this.pdfRef}
          disableAutomaticSaving={false}
          document={writableDocumentPath}
          configuration={{
            allowToolbarTitleChange: false,
            toolbarTitle: 'My Awesome Report',
            backgroundColor: processColor('lightgrey'),
            useParentNavigationBar: false,
          }}
          fragmentTag="PDF1"
          showNavigationButtonInToolbar={false}
          onNavigationButtonClicked={() => navigation.goBack()}
          onAnnotationTapped={e => console.log(e)}
          onDocumentSaved={(_) => this.onDocumentSaved(this.pdfRef.current)}
          menuItemGrouping={[
            'freetext',
            { key: 'markup', items: ['highlight', 'underline'] },
            'ink',
            'image',
          ]}
          style={styles.pdfColor}
        />
      </View>
    );
  }
}
const styles = {
  flex: { flex: 1 },
  pdfColor: { flex: 1, color: pspdfkitColor },
};
