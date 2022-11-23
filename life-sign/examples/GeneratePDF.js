import React, { memo, useEffect, useState } from 'react';
import { BaseExampleAutoHidingHeaderComponent } from '../helpers/BaseExampleAutoHidingHeaderComponent';
import { ActivityIndicator, Button, NativeModules, processColor, View } from 'react-native';
import PSPDFKitView from 'react-native-pspdfkit';
import { pspdfkitColor, writableDocumentPath } from '../configuration/Constants';
import { hideToolbar } from '../helpers/NavigationHelper';
import { documentName, extractAsset, fileExists, getOutputPath } from '../helpers/FileHelper';
import { PSPDFKit } from '../helpers/PSPDFKit';
const { RNProcessor: Processor } = NativeModules;
import fileSystem from 'react-native-fs';


function GeneratePDF(props) {
  const pdfRef = React.createRef();
  const [pathPdf, setPathPdf] = useState("");

  const getLinkPdf = async () => {
    let fileURL = null;
    const fileName = 'newPDFFromURLL';
    try {
      fileURL = await getOutputPath(fileName);
    } catch (e) {
      console.log(e.message, e.code);
      alert(e.message);
    }

    const configuration = {
      filePath: fileURL,
      override: true,
    };
    let originURL = 'https://v51.x8top.net/tmp082020/cf/tailieu/2019/2/pdf/mau-don-xin-xac-nhan-dan-su-33292.pdf';

    try {
      let { fileURL: outputURL } = await Processor.generatePDFFromHtmlURL(
        configuration,
        originURL,
      );
      // Do something with new file

      if (Platform.OS === 'android') {
        PSPDFKit.present(outputURL, { title: 'Generate PDF from URL' });
        return;
      }

      // In this example, we will open it in PSPDFKit view component from the same location where other pdf documents resides, PDFs folder in the root of the RN app
      await extractAsset(
        outputURL,
        documentName(fileName),
        async mainPath => {
          console.log(mainPath, "kkk");
          setPathPdf(mainPath)
          // if (await fileExists(mainPath)) {
          //   console.log(mainPath, "mainPath");
          //   setPathPdf(mainPath)
          // }
        },
      );
    } catch (e) {
      console.log(e.message, e.code);
      alert(e.message);
    }
  }

  useEffect(() => {
    getLinkPdf()
  }, [])

  return (
    <>
      {String(pathPdf).length !== 0 ? <View style={styles.flex}>
        <PSPDFKitView
          ref={pdfRef}
          document={String(pathPdf)}
          disableAutomaticSaving={true}
          configuration={{
            backgroundColor: processColor('lightgrey'),
          }}
          pageIndex={3}
          style={styles.colorView(pspdfkitColor)}
        />
        <View style={styles.buttonContainer}>
          <View style={styles.flex}>
            <Button
              onPress={() => {
                // Ensure that the path to the new document is a writable document path
                // You can use a React Native package like https://github.com/rnmods/react-native-document-picker to allow users of your application to select the path and the file name for the new document
                const newDocumentPath =
                  fileSystem.DocumentDirectoryPath + '/newdocument.pdf';
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
                    pdfRef.current
                      .saveCurrentDocument()
                      .then(saved => {
                        // Then, embed all the annotations
                        PSPDFKit.processAnnotations(
                          'embed',
                          'all',
                          writableDocumentPath,
                          newDocumentPath,
                        )
                          .then(success => {
                            if (success) {
                              alert(`Document saved as ${newDocumentPath}`);
                            } else {
                              alert('Failed to save document');
                            }
                          })
                          .catch(error => {
                            alert(JSON.stringify(error));
                          });
                      })
                      .catch(error => {
                        alert(JSON.stringify(error));
                      });
                  });
              }}
              title="Save As"
            />
          </View>
        </View>
      </View>
        :
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }
    </>

  );
}

const styles = {
  // flex: { flex: 1 },
  // pdfColor: { flex: 1, color: pspdfkitColor },
  flex: { flex: 1 },
  colorView: color => ({ flex: 1, color }),
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
};

export default memo(GeneratePDF);
