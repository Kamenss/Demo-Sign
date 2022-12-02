import React, { memo, useEffect, useState, useRef } from 'react';
import { BaseExampleAutoHidingHeaderComponent } from '../helpers/BaseExampleAutoHidingHeaderComponent';
import {
  ActivityIndicator,
  Button,
  NativeModules,
  Platform,
  processColor,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PSPDFKitView from 'react-native-pspdfkit';
import {
  pspdfkitColor,
  writableDocumentPath,
} from '../configuration/Constants';
import { hideToolbar } from '../helpers/NavigationHelper';
import {
  documentName,
  extractAsset,
  fileExists,
  getOutputPath,
} from '../helpers/FileHelper';
import { PSPDFKit } from '../helpers/PSPDFKit';
const { RNProcessor: Processor } = NativeModules;
import fileSystem from 'react-native-fs';

function GeneratePDF(props) {
  const pdfRef = useRef(null);
  const [pathPdf, setPathPdf] = useState('');
  const [isLoading, setLoading] = useState(false);

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
    let originURL =
      'https://g.lifetek.vn:203/api/file-system/GetImage/HADO?id=636e1ba6a38b182dba2fa388';

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
      await extractAsset(outputURL, documentName(fileName), async mainPath => {
        console.log(mainPath, 'kkk');
        setPathPdf(mainPath);
        // if (await fileExists(mainPath)) {
        //   console.log(mainPath, "mainPath");
        //   setPathPdf(mainPath)
        // }
      });
    } catch (e) {
      console.log(e.message, e.code);
      alert(e.message);
    }
  };

  const getPdfFromUrl = async () => {
    let fileURL = null;
    const fileName = 'newPDFFromURL.pdf';
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
    let originURL =
      'https://g.lifetek.vn:203/api/file-system/GetImage/HADO?id=636e1ba6a38b182dba2fa388';

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
      const desPath = fileSystem.DocumentDirectoryPath + '/' + fileName;
      if (await fileSystem.exists(desPath)) {
        await fileSystem.unlink(desPath);
      }

      await fileSystem.copyFile(outputURL, desPath);

      setPathPdf(desPath);

      // setPathPdf(outputURL.replace('file://', ''));
      // // In this example, we will open it in PSPDFKit view component from the same location where other pdf documents resides, PDFs folder in the root of the RN app
      // extractAsset(outputURL, documentName(fileName), async mainPath => {
      //   if (await fileExists(mainPath)) {
      //     console.log('mainPath ', mainPath);
      //     // component.props.navigation.push('GeneratePDF', {
      //     //   documentPath: `PDFs/${documentName(fileName)}`,
      //     //   fullPath: mainPath,
      //     //   title: 'Generate PDF from URL',
      //     // });
      //   }
      // });
    } catch (e) {
      console.log(e.message, e.code);
      alert(e.message);
    }
  };

  useEffect(() => {
    getPdfFromUrl();
  }, []);

  return (
    <>
      {String(pathPdf).length !== 0 ? (
        <View style={styles.flex}>
          <PSPDFKitView
            ref={pdfRef}
            document={String(pathPdf)}
            disableAutomaticSaving={true}
            configuration={{
              backgroundColor: processColor('lightgrey'),
            }}
            // pageIndex={3}
            style={styles.colorView(pspdfkitColor)}
          />
          <View style={styles.buttonContainer}>
            <View style={styles.flex}>
              <TouchableOpacity
                disabled={isLoading}
                onPress={async () => {
                  setLoading(true);
                  // Ensure that the path to the new document is a writable document path
                  // You can use a React Native package like https://github.com/rnmods/react-native-document-picker to allow users of your application to select the path and the file name for the new document
                  const fileName = 'newdocument.pdf';
                  const newDocumentPath =
                    fileSystem.DocumentDirectoryPath + '/' + fileName;
                  try {
                    const isExists = await fileSystem.exists(newDocumentPath);

                    if (isExists) {
                      await fileSystem.unlink(newDocumentPath);
                    }

                    await pdfRef.current.saveCurrentDocument();
                    await PSPDFKit.processAnnotations(
                      'embed',
                      'all',
                      pathPdf,
                      newDocumentPath,
                    );

                    const formData = new FormData();

                    formData.append('file', {
                      name: fileName,
                      uri: newDocumentPath,
                      type: 'application/pdf',
                    });

                    const res = await fetch(
                      // 'https://dominion.jp.ngrok.io/upload',
                      'https://administrator.lifetek.vn:203/api/save-file',
                      {
                        body: formData,
                        method: 'POST',
                        headers: {
                          'Content-Type': 'multipart/form-data',
                        },
                      },
                    ).then(r => r.json());
                    alert(JSON.stringify(res));
                  } catch (error) {
                    alert(error?.message || 'Can not upload file');
                    console.log('=>>>> Error', error);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Text style={{ color: 'green', fontSize: 18 }}>
                  {isLoading ? 'Uploading....' : 'Save As'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
}

const styles = {
  // flex: { flex: 1 },
  // pdfColor: { flex: 1, color: pspdfkitColor },
  flex: { flex: 1 },
  colorView: color => ({ flex: 1, color }),
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    height: 65,
    padding: 10,
  },
};

export default memo(GeneratePDF);
