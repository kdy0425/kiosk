import os
import requests
import xml.etree.ElementTree as ET
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def remove_blank_lines(text: str) -> str:
    return "\n".join([line for line in text.splitlines() if line.strip() != ""])

def download_kiosk_data(kiosk_code, base_download_dir):
    try:
        if not os.path.exists(base_download_dir):
            os.makedirs(base_download_dir)

        kiosk_data_url = f"http://hdc.tovair.com/user/xml/kiosk_data.jsp?kiosk_code={kiosk_code}"
        # kiosk_data_url = f"https://tbapi.tovair.com/user/xml/kiosk_data?kiosk_code={kiosk_code}"
        response = requests.get(kiosk_data_url, verify=False)  # 인증서 확인 비활성화

        if response.status_code == 200:
            xml_content = remove_blank_lines(response.text)
            xml_dir  = os.path.join(base_download_dir, "xml")
            if not os.path.exists(xml_dir):
                os.makedirs(xml_dir)

            xml_path = os.path.join(xml_dir, "kiosk_data.xml")  # ✔ 파일 이름까지 지정
            with open(xml_path, "w", encoding="utf-8") as xml_file:
                xml_file.write(xml_content)

            print(f"kiosk_data.xml downloaded and saved to {xml_path}")

            tree = ET.ElementTree(ET.fromstring(xml_content))
            root = tree.getroot()

            info_elements = root.findall(".//INFO")

            for info in info_elements:
                path_elem = info.find("PATH")
                file_name_elem = info.find("FILE_NAME")
                file_url_elem = info.find("FILE_URL")  # <- 수정된 부분

                if path_elem is None or file_name_elem is None or file_url_elem is None:
                    print(f"Skipping INFO block due to missing tag: {ET.tostring(info, encoding='unicode')}")
                    continue

                path = path_elem.text
                file_name = file_name_elem.text
                file_url = file_url_elem.text

                target_dir = os.path.join(base_download_dir, path.strip("/"))
                if not os.path.exists(target_dir):
                    os.makedirs(target_dir)

                file_path = os.path.join(target_dir, file_name)

                print(f"Downloading {file_name}...")
                file_response = requests.get(file_url, stream=True, verify=False)

                if file_response.status_code == 200:
                    with open(file_path, "wb") as file:
                        for chunk in file_response.iter_content(chunk_size=8192):
                            file.write(chunk)
                    print(f"Downloaded: {file_path}")
                else:
                    print(f"Failed to download {file_name}: {file_response.status_code}")


        else:
            print(f"Failed to fetch kiosk_data.xml: {response.status_code}")

    except Exception as e:
        print(f"An error occurred: {e}")

def download_kiosk_contents(kiosk_code, base_download_dir):
    try:
        if not os.path.exists(base_download_dir):
            os.makedirs(base_download_dir)

        kiosk_contents_url = f"http://hdc.tovair.com/user/xml/kiosk_contents.jsp?kiosk_code={kiosk_code}"
        response = requests.get(kiosk_contents_url, verify=False)

        if response.status_code == 200:
            xml_content = remove_blank_lines(response.text)
            includes_dir = os.path.join(base_download_dir, "xml")

            if not os.path.exists(includes_dir):
                os.makedirs(includes_dir)

            xml_path = os.path.join(includes_dir, "kiosk_contents.xml")
            with open(xml_path, "w", encoding="utf-8") as xml_file:
                xml_file.write(xml_content)

            print(f"kiosk_contents.xml saved to {xml_path}")

        else:
            print(f"Failed to fetch kiosk_contents: {response.status_code}")

    except Exception as e:
        import traceback
        traceback.print_exc()


# kiosk_code = "D11"  # 55 인치
kiosk_code = "BHDCH002"  # 25 인치


base_download_dir = r"D:/dyworks/202505_cheongju-hyundai-kiosk-bf"

download_kiosk_data(kiosk_code, base_download_dir)
download_kiosk_contents(kiosk_code, base_download_dir)
